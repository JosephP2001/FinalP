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
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/stats', getAdminStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with their statistics
 * @access  Private/Admin
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed information about a specific user
 * @access  Private/Admin
 */
router.get('/users/:id', getUserDetails);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user and all their related data
 * @access  Private/Admin
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role (user <-> admin)
 * @access  Private/Admin
 */
router.patch('/users/:id/role', updateUserRole);

export default router;