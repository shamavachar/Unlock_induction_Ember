const express = require("express");
const router = express.Router();

const {
    registerStudent,
    loginStudent,
    loginAdmin,
    getMe,
} = require("../controller/authController");

const { protect } = require("../middleware/auth");

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rahul Sharma"
 *               email:
 *                 type: string
 *                 example: "rahul@college.edu"
 *               password:
 *                 type: string
 *                 example: "student123"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               rollNumber:
 *                 type: string
 *                 example: "CS-2024-042"
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Validation error or duplicate email
 */
router.post("/register", registerStudent);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Student login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "rahul@college.edu"
 *               password:
 *                 type: string
 *                 example: "student123"
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginStudent);

/**
 * @openapi
 * /auth/admin/login:
 *   post:
 *     summary: Canteen Staff (Admin) login with predefined credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "canteen_admin"
 *               password:
 *                 type: string
 *                 example: "admin@canteen123"
 *     responses:
 *       200:
 *         description: Admin login successful with JWT token
 *       401:
 *         description: Invalid admin credentials
 */
router.post("/admin/login", loginAdmin);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMe);

module.exports = router;
