const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socketHandler");

const section = (t) => console.log(`\n${"═".repeat(55)}\n  ${t}\n${"═".repeat(55)}`);
const ok = (m) => console.log(`  ✅  ${m}`);
const fail = (m) => { throw new Error(`  ❌  ${m}`); };

async function runAuthTests() {
    await connectDB();
    const server = http.createServer(app);
    initSocket(server);
    await new Promise((r) => server.listen(5003, r));
    console.log("\n🔐 Auth Test Server up on port 5003");

    const base = "http://localhost:5003/api";
    const req = async (method, path, body, token) => {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${base}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        return { status: res.status, data: await res.json() };
    };

    let studentToken = null;
    let adminToken = null;
    let orderId = null;
    let menuItemId = null;

    try {

        section("1. PUBLIC ROUTES — No token needed");
        const menu = await req("GET", "/menu?availableOnly=true");
        if (menu.status !== 200) fail("Menu should be public");
        ok(`GET /api/menu → ${menu.data.count} items (public ✓)`);
        menuItemId = menu.data.data[0]._id;

        const queue = await req("GET", "/queue/live");
        if (queue.status !== 200) fail("Queue should be public");
        ok(`GET /api/queue/live → public ✓`);

        const track = await req("GET", "/orders/track/CR-999");
        if (track.status !== 404) fail("Should return 404 for unknown token");
        ok(`GET /api/orders/track/:token → public ✓ (404 for unknown token)`);

        section("2. STUDENT: SIGNUP (Register)");
        const reg = await req("POST", "/auth/register", {
            name: "Ananya Patel",
            email: "ananya@college.edu",
            password: "student123",
            phone: "9988776655",
            rollNumber: "CS-2024-099",
        });
        if (reg.status !== 201) fail(`Register failed: ${JSON.stringify(reg.data)}`);
        studentToken = reg.data.token;
        ok(`Registered: ${reg.data.user.name} (${reg.data.user.email})`);
        ok(`Student token issued ✓`);

        const dup = await req("POST", "/auth/register", {
            name: "Duplicate", email: "ananya@college.edu", password: "pass123",
        });
        if (dup.status !== 400) fail("Duplicate email should return 400");
        ok(`Duplicate email correctly rejected ✓`);

        section("3. STUDENT: LOGIN");
        const login = await req("POST", "/auth/login", {
            email: "ananya@college.edu", password: "student123",
        });
        if (login.status !== 200) fail(`Login failed: ${JSON.stringify(login.data)}`);
        studentToken = login.data.token;
        ok(`Login successful: ${login.data.message}`);

        section("4. ADMIN: LOGIN");
        const adminLogin = await req("POST", "/auth/admin/login", {
            username: process.env.ADMIN_USERNAME || "canteen_admin",
            password: process.env.ADMIN_PASSWORD || "admin@canteen123",
        });
        if (adminLogin.status !== 200) fail(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
        adminToken = adminLogin.data.token;
        ok(`Admin login successful: ${adminLogin.data.message}`);

        section("5. GET /auth/me — Profile");
        const meStudent = await req("GET", "/auth/me", null, studentToken);
        if (meStudent.status !== 200) fail("Student /me failed");
        ok(`Student profile: ${meStudent.data.data.name} | ${meStudent.data.data.role}`);

        const meAdmin = await req("GET", "/auth/me", null, adminToken);
        if (meAdmin.status !== 200) fail("Admin /me failed");
        ok(`Admin profile: ${meAdmin.data.data.username} | ${meAdmin.data.data.role}`);

        section("6. PROTECTED ROUTES — Blocked without token");
        const noAuth = await req("GET", "/orders");
        if (noAuth.status !== 401) fail("GET /orders should require admin token");
        ok(`GET /orders without token → 401 ✓`);

        const noAuthStats = await req("GET", "/stats/dashboard");
        if (noAuthStats.status !== 401) fail("Stats should require token");
        ok(`GET /stats/dashboard without token → 401 ✓`);

        section("7. STUDENT TOKEN — Cannot access admin routes");
        const studentOrders = await req("GET", "/orders", null, studentToken);
        if (studentOrders.status !== 403) fail("Student should get 403 on admin route");
        ok(`Student token on GET /orders → 403 Forbidden ✓`);

        section("8. GUEST ORDER — Public order placement");
        const guestOrder = await req("POST", "/orders", {
            studentName: "Rohan Kumar",
            studentPhone: "9000000001",
            items: [{ menuItemId, quantity: 1 }],
        });
        if (guestOrder.status !== 201) fail(`Guest order failed: ${JSON.stringify(guestOrder.data)}`);
        ok(`Guest order placed: Token ${guestOrder.data.data.tokenNumber} ✓`);

        section("9. LOGGED-IN STUDENT ORDER — With token");
        const studentOrder = await req("POST", "/orders", {
            studentName: "Ananya Patel",
            items: [{ menuItemId, quantity: 1 }],
        }, studentToken);
        if (studentOrder.status !== 201) fail(`Student order failed: ${JSON.stringify(studentOrder.data)}`);
        orderId = studentOrder.data.data._id;
        ok(`Logged-in student order: Token ${studentOrder.data.data.tokenNumber} ✓`);

        section("10. ADMIN: Staff Operations");
        const allOrders = await req("GET", "/orders?status=active", null, adminToken);
        if (allOrders.status !== 200) fail("Admin GET /orders failed");
        ok(`Admin sees ${allOrders.data.count} active orders`);

        const prep = await req("PATCH", `/orders/${orderId}/status`, {
            status: "Preparing",
        }, adminToken);
        if (prep.status !== 200) fail("Admin status update failed");
        ok(`Admin moved order to: ${prep.data.data.status} ✓`);

        const ready = await req("PATCH", `/orders/${orderId}/status`, {
            status: "Ready",
        }, adminToken);
        ok(`Admin moved order to: ${ready.data.data.status} ✓`);

        const dash = await req("GET", "/stats/dashboard", null, adminToken);
        if (dash.status !== 200) fail("Admin dashboard failed");
        ok(`Admin dashboard: ${dash.data.data.today.totalOrders} orders today ✓`);

        section("🎉 ALL AUTH TESTS PASSED");
    } catch (e) {
        console.error(`\n${e.message}`);
    } finally {
        server.close();
        process.exit(0);
    }
}

runAuthTests();
