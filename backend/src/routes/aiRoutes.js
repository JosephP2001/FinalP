import express from 'express';
import { protect } from '../middlewares/auth.js';
import { rateLimitAI, getRateLimitStatus } from '../middlewares/aiRateLimit.js';
import { getAIAnalysis } from '../services/aiService.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';

const router = express.Router();

// All AI routes require authentication
 
router.use(protect);

/**
 * @route   GET /api/ai/rate-limit-status
 * @desc    Get current rate limit status for authenticated user
 * @access  Private
 */
router.get('/rate-limit-status', async (req, res) => {
  try {
    const status = await getRateLimitStatus(req.user.id);
    
    if (!status) {
      return res.status(200).json({
        success: true,
        message: 'Rate limiting unavailable (Redis not connected)',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving rate limit status'
    });
  }
});

/**
 * @swagger
 * /api/ai/analyze-survey/{surveyId}:
 *   post:
 *     summary: Analyze full survey with AI (Groq) - Rate Limited
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
 *                 rateLimitInfo:
 *                   type: object
 *                   description: Information about remaining API calls
 *       400:
 *         description: No responses available for analysis
 *       403:
 *         description: Not authorized to analyze this survey
 *       404:
 *         description: Survey not found
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                   enum: [HOURLY_LIMIT_EXCEEDED, DAILY_LIMIT_EXCEEDED, SURVEY_LIMIT_EXCEEDED, COOLDOWN_ACTIVE]
 *                 retryAfter:
 *                   type: number
 *                   description: Seconds until retry is allowed
 *                 limit:
 *                   type: object
 */
router.post('/analyze-survey/:surveyId', rateLimitAI, async (req, res) => {
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
    console.log('📊 Rate limit info:', req.rateLimitInfo);
    
    const analysis = await getAIAnalysis(survey, responses);

    // Include rate limit info in response
    res.status(200).json({
      ...analysis,
      rateLimitInfo: req.rateLimitInfo
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating AI analysis'
    });
  }
});

export default router;