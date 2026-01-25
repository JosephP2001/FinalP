import express from 'express';
import { protect } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/authorize.js';
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAdminStats,
  getUserDetails
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * All admin routes require:
 * 1. Authentication (protect middleware)
 * 2. Admin role (isAdmin middleware)
 */
router.use(protect);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/stats', getAdminStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with their statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get detailed information about a specific user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.get('/users/:id', getUserDetails);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user and all their related data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete yourself
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role (user <-> admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role or cannot change own role
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.patch('/users/:id/role', updateUserRole);

export default router;