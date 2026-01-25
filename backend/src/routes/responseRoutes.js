import express from 'express';
import {
  submitResponse,
  getSurveyResponses,
  getSurveyStats
} from '../controllers/responseController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/responses:
 *   post:
 *     summary: Submit a response to a survey (public)
 *     tags: [Responses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - surveyId
 *               - respondentEmail
 *               - answers
 *             properties:
 *               surveyId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               respondentEmail:
 *                 type: string
 *                 format: email
 *                 example: respondent@uce.edu.ec
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *       400:
 *         description: Invalid data or already responded
 */
router.post('/', submitResponse);

/**
 * @swagger
 * /api/responses/survey/{surveyId}:
 *   get:
 *     summary: Get all responses for a survey (owner only)
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Responses retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get('/survey/:surveyId', protect, getSurveyResponses);

/**
 * @swagger
 * /api/responses/survey/{surveyId}/stats:
 *   get:
 *     summary: Get statistics for a survey (owner only)
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get('/survey/:surveyId/stats', protect, getSurveyStats);

export default router;