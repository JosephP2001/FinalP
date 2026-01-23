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
 * @route   POST /api/ai/analyze-survey/:surveyId
 * @desc    Analyze full survey with AI
 * @access  Private
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