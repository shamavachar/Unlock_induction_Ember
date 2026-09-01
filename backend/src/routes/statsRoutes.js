const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/statsController");

/**
 * @openapi
 * /stats/dashboard:
 *   get:
 *     summary: Get kitchen & staff analytics dashboard metrics
 *     description: Returns today's total revenue, order count, breakdown by status, top 5 selling items, out-of-stock count, and low-stock warning items.
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     today:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 48
 *                         totalRevenue:
 *                           type: number
 *                           example: 3840
 *                         activeOrders:
 *                           type: number
 *                           example: 5
 *                         statusBreakdown:
 *                           type: object
 *                         topSellingItems:
 *                           type: array
 *                           items:
 *                             type: object
 *                     inventory:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: number
 *                           example: 18
 *                         outOfStock:
 *                           type: number
 *                           example: 2
 *                         lowStockItems:
 *                           type: array
 *                           items:
 *                             type: object
 */
router.get("/dashboard", getDashboardStats);

module.exports = router;
