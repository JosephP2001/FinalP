import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import { getAIAnalysis as getGroqAnalysis } from '../services/aiService.js';

// @desc    Get all surveys (public)
// @route   GET /api/surveys
// @access  Public
export const getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ status: 'active' })
      .select('-questions')
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

// @desc    Get my surveys
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

// @desc    Create new survey
// @route   POST /api/surveys
// @access  Private
export const createSurvey = async (req, res) => {
  try {
    const surveyData = {
      ...req.body,
      creator: req.user.id
    };

    const survey = await Survey.create(surveyData);
    
    console.log('✅ Survey created:', {
      id: survey._id,
      title: survey.title,
      maxResponses: survey.settings?.maxResponses
    });

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: survey
    });
  } catch (error) {
    console.error('Create survey error:', error);
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

    // Ownership verification
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

    // Ownership verification
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

// @desc    Get AI analysis of survey responses
// @route   GET /api/surveys/:id/ai-analysis
// @access  Private
export const getAIAnalysis = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Ownership verification
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this analysis'
      });
    }

    // Get responses
    const responses = await Response.find({ surveyId: req.params.id });

    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No responses available for analysis'
      });
    }

    // Generate AI analysis
    const analysis = await getGroqAnalysis(survey, responses);

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

//----ADMIN----ADMIN----ADMIN----ADMIN----ADMIN----ADMIN----ADMIN----ADMIN----
// @desc    Get ALL surveys (admin only)
// @route   GET /api/surveys/admin/all-surveys
// @access  Private (Admin)
export const getAllSurveysAdmin = async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate('creator', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: surveys.length,
      data: surveys
    });
  } catch (error) {
    console.error('Get all surveys admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};