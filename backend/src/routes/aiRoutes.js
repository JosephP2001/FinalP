import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getAIAnalysis } from '../services/aiService.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';

const router = express.Router();

/**
 * All AI routes require authentication
 */
router.use(protect);

/**
 * @swagger
 * /api/ai/analyze-survey/{surveyId}:
 *   post:
 *     summary: Analyze full survey with AI (Groq)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID to analyze
 *     responses:
 *       200:
 *         description: AI analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: string
 *                     keyInsights:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sentiment:
 *                       type: object
 *                       properties:
 *                         overall:
 *                           type: string
 *                         score:
 *                           type: number
 *                         explanation:
 *                           type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: No responses available for analysis
 *       403:
 *         description: Not authorized to analyze this survey
 *       404:
 *         description: Survey not found
 */
router.post('/analyze-survey/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Get survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Verify ownership or admin
    if (survey.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to analyze this survey'
      });
    }

    // Get responses
    const responses = await Response.find({ surveyId });

    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No responses available for analysis'
      });
    }

    // Call AI analysis service
    console.log('🤖 Starting AI analysis for survey:', survey.title);
    const analysis = await getAIAnalysis(survey, responses);

    res.status(200).json(analysis);

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating AI analysis'
    });
  }
});

export default router;