import express from 'express';
import {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getMySurveys,
  getAIAnalysis,
  getAllSurveysAdmin
} from '../controllers/surveyController.js';
import { protect } from '../middlewares/auth.js';
import { isAdmin, isOwnerOrAdmin } from '../middlewares/authorize.js';
import { cacheMiddleware } from '../middlewares/cache.js';

const router = express.Router();

/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: Get all active surveys (public)
 *     tags: [Surveys]
 *     responses:
 *       200:
 *         description: List of surveys retrieved successfully
 */
router.get('/', cacheMiddleware(300), getSurveys);

/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Get single survey by ID
 *     tags: [Surveys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Survey retrieved successfully
 *       404:
 *         description: Survey not found
 */
router.get('/:id', cacheMiddleware(600), getSurvey);

/**
 * @swagger
 * /api/surveys/my/surveys:
 *   get:
 *     summary: Get current user's surveys
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User surveys retrieved
 *       401:
 *         description: Not authenticated
 */
router.get('/my/surveys', protect, getMySurveys);

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Create a new survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *                 example: Customer Satisfaction Survey
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *               status:
 *                 type: string
 *                 enum: [draft, active]
 *     responses:
 *       201:
 *         description: Survey created successfully
 *       401:
 *         description: Not authenticated
 */
router.post('/', protect, createSurvey);

/**
 * @swagger
 * /api/surveys/{id}:
 *   put:
 *     summary: Update survey (owner or admin only)
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Survey updated successfully
 *       403:
 *         description: Not authorized
 */
router.put('/:id', protect, isOwnerOrAdmin, updateSurvey);

/**
 * @swagger
 * /api/surveys/{id}:
 *   delete:
 *     summary: Delete survey (owner or admin only)
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Survey deleted successfully
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', protect, isOwnerOrAdmin, deleteSurvey);

/**
 * @swagger
 * /api/surveys/{id}/ai-analysis:
 *   get:
 *     summary: Get AI analysis for survey (owner or admin only)
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI analysis retrieved
 *       403:
 *         description: Not authorized
 */
router.get('/:id/ai-analysis', protect, isOwnerOrAdmin, getAIAnalysis);

/**
 * @swagger
 * /api/surveys/admin/all-surveys:
 *   get:
 *     summary: Get all surveys in system (admin only)
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All surveys retrieved
 *       403:
 *         description: Admin access required
 */
router.get('/admin/all-surveys', protect, isAdmin, getAllSurveysAdmin);

export default router;