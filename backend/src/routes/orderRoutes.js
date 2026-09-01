const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
} = require("../controller/orderController");

// ── Special routes BEFORE /:id ────────────────────────────────────────────────

/**
 * @openapi
 * /orders/track/{tokenOrId}:
 *   get:
 *     summary: Track order by Token number (CR-101) or Mongo ObjectId
 *     description: Returns order status, dynamic queue position, estimated wait time, and student-friendly status message.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: tokenOrId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token number (e.g. CR-101) or Order MongoDB ID
 *     responses:
 *       200:
 *         description: Order tracking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get("/track/:tokenOrId", trackOrder);

// ── Base routes ───────────────────────────────────────────────────────────────

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Place a new food order (Student)
 *     description: Validates live stock, deducts stock atomically, generates a unique daily token (e.g. CR-101), calculates wait time, and broadcasts via Socket.IO.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order placed! Your token is CR-101. Estimated wait: ~12 min."
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Out of stock or invalid data
 *   get:
 *     summary: Get all orders with filter & pagination (Staff)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Waiting, Preparing, Ready, Completed, Cancelled, active, All]
 *         description: Filter by status ('active' gets Waiting + Preparing + Ready)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by token number, student name, or roll number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of orders with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pages:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */
router.route("/")
    .post(createOrder)  // STUDENT: Place a new order
    .get(getOrders);    // STAFF:   View all orders (with filters)

// ── Order-specific routes ─────────────────────────────────────────────────────

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Get single order by MongoDB ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.route("/:id")
    .get(getOrderById); // STAFF/STUDENT: Get single order details

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status transition (Staff)
 *     description: Enforces pipeline transitions Waiting -> Preparing -> Ready -> Completed. Broadcasts update in real-time.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Waiting, Preparing, Ready, Completed, Cancelled]
 *                 example: Preparing
 *               note:
 *                 type: string
 *                 example: "Started frying"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid state transition
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status", updateOrderStatus);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order & automatically restore inventory (Staff/Student)
 *     description: Cancels any non-completed order, restores stock quantities for all contained items, and broadcasts update.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Customer changed mind"
 *     responses:
 *       200:
 *         description: Order cancelled and stock restored
 *       400:
 *         description: Cannot cancel completed order
 *       404:
 *         description: Order not found
 */
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
