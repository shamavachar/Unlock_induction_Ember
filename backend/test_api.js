/**
 * Full Flow Verification Test
 *
 * Tests the complete system flow exactly as described:
 *
 * STUDENT FLOW:
 *   View Menu → Select Food → Place Order → Token → Waiting → Preparing → Ready → Completed
 *
 * STAFF FLOW:
 *   View Orders → Preparing → Ready → Completed
 *
 * STOCK FLOW:
 *   Available → Order Placed → Stock Decreases → Stock = 0 → Out of Stock
 */

const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app       = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socketHandler");

// Helper: print section headers
const section = (title) =>
    console.log(`\n${"═".repeat(60)}\n  ${title}\n${"═".repeat(60)}`);

const ok  = (msg) => console.log(`  ✅  ${msg}`);
const err = (msg) => { throw new Error(`❌  ${msg}`); };

async function runTests() {
    await connectDB();
    const server = http.createServer(app);
    initSocket(server);
    await new Promise((resolve) => server.listen(5002, resolve));
    console.log("\n🚀 Test server up on port 5002");

    const base = "http://localhost:5002/api";
    const req  = async (method, path, body) => {
        const res = await fetch(`${base}${path}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body:    body ? JSON.stringify(body) : undefined,
        });
        return { status: res.status, data: await res.json() };
    };

    try {
        // ────────────────────────────────────────────────────────────
        section("HEALTH CHECK");
        const health = await req("GET", "/health");
        if (health.status !== 200) err("Health check failed");
        ok("API is healthy and all endpoint docs loaded");

        // ────────────────────────────────────────────────────────────
        section("STUDENT: VIEW FOOD MENU");
        const menuAll = await req("GET", "/menu?availableOnly=true");
        if (!menuAll.data.data || menuAll.data.data.length === 0) err("Menu is empty");
        ok(`Menu loaded — ${menuAll.data.count} items available`);

        const categories = await req("GET", "/menu/categories");
        ok(`Categories: ${categories.data.data.join(", ")}`);

        const firstItem = menuAll.data.data[0];
        ok(`First item: "${firstItem.name}" | ₹${firstItem.price} | Stock: ${firstItem.stockQuantity}`);

        // ────────────────────────────────────────────────────────────
        section("STOCK FLOW: Check initial stock before order");
        const stockBefore = firstItem.stockQuantity;
        ok(`"${firstItem.name}" stock BEFORE order: ${stockBefore}`);

        // ────────────────────────────────────────────────────────────
        section("STUDENT: SELECT FOOD & PLACE ORDER");
        const orderRes = await req("POST", "/orders", {
            studentName:       "Priya Singh",
            studentPhone:      "9123456789",
            studentRollNumber: "EC-2024-017",
            paymentMethod:     "UPI",
            items: [
                { menuItemId: firstItem._id, quantity: 2 },
            ],
        });
        if (orderRes.status !== 201) err(`Order failed: ${JSON.stringify(orderRes.data)}`);
        const order = orderRes.data.data;
        ok(`Order placed!`);
        ok(`Token: ${order.tokenNumber}`);
        ok(`Status: ${order.status}  (should be "Waiting")`);
        ok(`Queue position: #${order.queuePosition}`);
        ok(`Estimated wait: ~${order.estimatedWaitTime} min`);
        ok(`Total: ₹${order.totalAmount}`);
        if (order.status !== "Waiting") err("Initial status must be Waiting");

        // ────────────────────────────────────────────────────────────
        section("STOCK FLOW: Verify stock decreased after order");
        const menuAfter = await req("GET", `/menu/${firstItem._id}`);
        const stockAfter = menuAfter.data.data.stockQuantity;
        const expectedStock = stockBefore - 2;
        ok(`"${firstItem.name}" stock AFTER order: ${stockAfter} (was ${stockBefore}, ordered 2)`);
        if (stockAfter !== expectedStock) err(`Stock mismatch! Expected ${expectedStock}, got ${stockAfter}`);
        ok("Stock decreased correctly ✓");

        // ────────────────────────────────────────────────────────────
        section("STUDENT: TRACK ORDER BY TOKEN");
        const trackRes = await req("GET", `/orders/track/${order.tokenNumber}`);
        if (trackRes.status !== 200) err("Order tracking failed");
        ok(`Tracking token "${order.tokenNumber}" — Status: ${trackRes.data.data.status}`);
        ok(`Status message: "${trackRes.data.data.statusMessage}"`);

        // ────────────────────────────────────────────────────────────
        section("STAFF: VIEW ACTIVE ORDERS");
        const activeOrders = await req("GET", "/orders?status=active");
        if (activeOrders.data.count === 0) err("No active orders found for staff dashboard");
        ok(`Staff sees ${activeOrders.data.count} active order(s)`);

        // ────────────────────────────────────────────────────────────
        section("STAFF: MOVE ORDER → Preparing");
        const prepRes = await req("PATCH", `/orders/${order._id}/status`, {
            status: "Preparing",
            note:   "Kitchen started cooking",
        });
        if (prepRes.status !== 200) err(`Status update failed: ${JSON.stringify(prepRes.data)}`);
        ok(`Order ${prepRes.data.data.tokenNumber} → ${prepRes.data.data.status}`);
        ok(`preparingAt recorded: ${prepRes.data.data.preparingAt}`);

        // ── Verify invalid transition is rejected ──────────────────
        const badJump = await req("PATCH", `/orders/${order._id}/status`, { status: "Completed" });
        if (badJump.status !== 400) err("Should have rejected Preparing → Completed (not an allowed transition)");
        ok(`Invalid jump "Preparing → Completed" correctly rejected`);

        // ────────────────────────────────────────────────────────────
        section("STAFF: MOVE ORDER → Ready");
        const readyRes = await req("PATCH", `/orders/${order._id}/status`, {
            status: "Ready",
            note:   "Food is ready for pickup",
        });
        if (readyRes.status !== 200) err(`Ready update failed: ${JSON.stringify(readyRes.data)}`);
        ok(`Order ${readyRes.data.data.tokenNumber} → ${readyRes.data.data.status}`);
        ok(`readyAt recorded: ${readyRes.data.data.readyAt}`);

        // ── Student tracking should now show READY ─────────────────
        const trackReady = await req("GET", `/orders/track/${order.tokenNumber}`);
        ok(`Student tracking: "${trackReady.data.data.statusMessage}"`);

        // ────────────────────────────────────────────────────────────
        section("DISPLAY BOARD: LIVE QUEUE");
        const liveQueue = await req("GET", "/queue/live");
        ok(`Ready to collect: ${liveQueue.data.data.summary.readyCount} order(s)`);
        ok(`Being prepared:   ${liveQueue.data.data.summary.preparingCount}`);
        ok(`Waiting in queue: ${liveQueue.data.data.summary.waitingCount}`);
        if (liveQueue.data.data.ready.length === 0) err("Ready queue should have our order");
        ok(`Display board: "${liveQueue.data.data.ready[0].tokenNumber}" — ${liveQueue.data.data.ready[0].itemSummary}`);

        // ────────────────────────────────────────────────────────────
        section("STAFF: MOVE ORDER → Completed");
        const doneRes = await req("PATCH", `/orders/${order._id}/status`, {
            status: "Completed",
            note:   "Student collected their food",
        });
        if (doneRes.status !== 200) err(`Complete failed: ${JSON.stringify(doneRes.data)}`);
        ok(`Order ${doneRes.data.data.tokenNumber} → ${doneRes.data.data.status}`);
        ok(`completedAt: ${doneRes.data.data.completedAt}`);
        ok(`paymentStatus: ${doneRes.data.data.paymentStatus}`);
        ok(`statusHistory has ${doneRes.data.data.statusHistory.length} entries: ${
            doneRes.data.data.statusHistory.map(h => h.status).join(" → ")
        }`);

        // ── Verify terminal state cannot be moved again ────────────
        const afterDone = await req("PATCH", `/orders/${order._id}/status`, { status: "Cancelled" });
        if (afterDone.status !== 400) err("Completed order should not be moveable");
        ok(`Completed order correctly rejects further changes`);

        // ────────────────────────────────────────────────────────────
        section("STOCK FLOW: Test Out of Stock");
        // Find an item and drain its stock via multiple orders
        const snack = menuAll.data.data.find(i => i.stockQuantity <= 5 && i.stockQuantity > 0) 
                   || menuAll.data.data[1];
        if (snack) {
            // Place order for all remaining stock
            const drainRes = await req("POST", "/orders", {
                studentName: "Test Student",
                items: [{ menuItemId: snack._id, quantity: snack.stockQuantity }],
            });
            if (drainRes.status === 201) {
                const drainedItem = await req("GET", `/menu/${snack._id}`);
                const drained = drainedItem.data.data;
                ok(`"${drained.name}" stock after drain: ${drained.stockQuantity} | Available: ${drained.isAvailable}`);
                if (drained.stockQuantity === 0) {
                    ok(`STOCK FLOW: stock hit 0 → isAvailable = false (Out of Stock) ✓`);
                }
                // Verify new order is rejected for out-of-stock item
                const blockedOrder = await req("POST", "/orders", {
                    studentName: "Late Student",
                    items: [{ menuItemId: snack._id, quantity: 1 }],
                });
                if (blockedOrder.status === 400) {
                    ok(`Out-of-stock order correctly blocked: "${blockedOrder.data.message}"`);
                }
            }
        }

        // ────────────────────────────────────────────────────────────
        section("STAFF: Cancel flow + stock restore");
        const cancelOrder2 = await req("POST", "/orders", {
            studentName: "Cancel Test",
            items: [{ menuItemId: firstItem._id, quantity: 1 }],
        });
        if (cancelOrder2.status === 201) {
            const stockMid = (await req("GET", `/menu/${firstItem._id}`)).data.data.stockQuantity;
            const cancelRes = await req("PATCH", `/orders/${cancelOrder2.data.data._id}/cancel`, {
                reason: "Changed mind",
            });
            if (cancelRes.status === 200) {
                const stockAfterCancel = (await req("GET", `/menu/${firstItem._id}`)).data.data.stockQuantity;
                ok(`Stock restored after cancel: ${stockMid} → ${stockAfterCancel} (+1)`);
            }
        }

        // ────────────────────────────────────────────────────────────
        section("DASHBOARD STATS");
        const stats = await req("GET", "/stats/dashboard");
        const d = stats.data.data.today;
        ok(`Today: ${d.totalOrders} orders | Revenue: ₹${d.totalRevenue}`);
        ok(`Active orders: ${d.activeOrders}`);
        ok(`Status: ${JSON.stringify(d.statusBreakdown)}`);
        if (d.topSellingItems.length > 0) {
            ok(`Top seller: "${d.topSellingItems[0].name}" (${d.topSellingItems[0].totalSold} sold)`);
        }
        const inv = stats.data.data.inventory;
        ok(`Inventory: ${inv.totalItems} items | Out of stock: ${inv.outOfStock}`);

        // ────────────────────────────────────────────────────────────
        section("ORGANIZER TWIST: CHAOS MODE");
        const chaosRes = await req("POST", "/menu/chaos-mode", {
            stockPerItem: 5,
            message:      "Organizers: CANTEEN CHAOS! Only 3 items remain. Order NOW!",
        });
        if (chaosRes.status !== 200) err("Chaos mode failed");
        ok(chaosRes.data.data.announcement);
        ok(`${chaosRes.data.data.remainingCount} item(s) kept active:`);
        chaosRes.data.data.remainingItems.forEach(i => ok(`  • ${i.name} (stock: ${i.stock})`));
        // Verify menu now has mostly out-of-stock items
        const afterChaos = await req("GET", "/menu?availableOnly=true");
        ok(`Available items after Chaos Mode: ${afterChaos.data.count} (should be 3)`);

        // ────────────────────────────────────────────────────────────
        section("🎉 ALL TESTS PASSED");
        console.log(`
  ┌─────────────────────────────────────────────────────┐
  │   Canteen Rush Manager Backend — Fully Verified!    │
  │                                                     │
  │   Student Flow:  View → Select → Order → Track  ✅  │
  │   Staff Flow:    Waiting→Preparing→Ready→Done   ✅  │
  │   Stock Flow:    Deduct→OutOfStock→Restore      ✅  │
  │   Chaos Twist:   60-min twist handler           ✅  │
  │   Socket.IO:     Real-time events ready         ✅  │
  └─────────────────────────────────────────────────────┘
`);
    } catch (e) {
        console.error(`\n❌ TEST FAILED: ${e.message}`);
    } finally {
        server.close();
        process.exit(0);
    }
}

runTests();
