/*
*Added: IA analysis (DONE)
*Added: Fallback (DONE)
*Added: Error Handling (-->IA) (DONE)
*/ 



import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import { analyzeSurveyResponses, generateQuickSummary } from '../services/aiService.js';

// @desc    Get all surveys
// @route   GET /api/surveys
// @access  Public
export const getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ status: { $ne: 'draft' } })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: surveys.length,
      data: surveys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single survey
// @route   GET /api/surveys/:id
// @access  Public
export const getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('creator', 'name email');

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    res.status(200).json({
      success: true,
      data: survey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//----------CRUD-----------------CRUD------------CRUD----------------CRUD--------
// @desc    Create survey
// @route   POST /api/surveys
// @access  Private
export const createSurvey = async (req, res) => {
  try {
    const surveyData = {
      ...req.body,
      creator: req.user.id
    };

    const survey = await Survey.create(surveyData);

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: survey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update survey
// @route   PUT /api/surveys/:id
// @access  Private
export const updateSurvey = async (req, res) => {
  try {
    let survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Verify: User === Creator????
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this survey'
      });
    }

    survey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Survey updated successfully',
      data: survey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete survey
// @route   DELETE /api/surveys/:id
// @access  Private
export const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Verify: User === Creator????
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this survey'
      });
    }

    await survey.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's surveys
// @route   GET /api/surveys/my/surveys
// @access  Private
export const getMySurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ creator: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: surveys.length,
      data: surveys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get AI analysis of survey responses
// @route   GET /api/surveys/:id/ai-analysis
// @access  Private
//Search-Verify-Get-Validate--Generate-Return
export const getAIAnalysis = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Verify: User === Creator????
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analysis'
      });
    }

    // Get responses
    const responses = await Response.find({ survey: req.params.id });

    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No responses available for analysis'
      });
    }

    // IA Analysis Generator
    let analysis;
    
    if (process.env.GROQ_API_KEY) {  
      // using Groq IA
      analysis = await analyzeSurveyResponses(survey, responses);
    } else {
      // Fallback -> Basic Summary
      analysis = generateQuickSummary(survey, responses);
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};