import Survey from '../models/Survey.js';

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

    // Verificar que el usuario sea el creador
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

    // Verificar que el usuario sea el creador
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