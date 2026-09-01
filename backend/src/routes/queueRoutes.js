const express = require("express");
const router = express.Router();
const { getLiveQueue } = require("../controller/queueController");

/**
 * @openapi
 * /queue/live:
 *   get:
 *     summary: Get live queue for Display Board and TV screen
 *     description: Returns lists of orders Ready (now serving), Preparing (in kitchen), and Waiting (in queue), plus average wait time and active counts.
 *     tags: [Queue]
 *     responses:
 *       200:
 *         description: Live queue data
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
 *                     ready:
 *                       type: array
 *                       items:
 *                         type: object
 *                     preparing:
 *                       type: array
 *                       items:
 *                         type: object
 *                     waiting:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalActive:
 *                           type: number
 *                         readyCount:
 *                           type: number
 *                         preparingCount:
 *                           type: number
 *                         waitingCount:
 *                           type: number
 *                         averageWaitMinutes:
 *                           type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 */
router.get("/live", getLiveQueue);

module.exports = router;
