import Response from '../models/Response.js';
import Survey from '../models/Survey.js';

// @desc    Submit response to survey
// @route   POST /api/responses
// @access  Public
export const submitResponse = async (req, res) => {
  try {
    const { surveyId, answers } = req.body;

    // Verificar que la encuesta existe
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Crear respuesta
    const response = await Response.create({
      survey: surveyId,
      answers,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        submittedAt: new Date()
      },
      isAnonymous: true
    });

    // Incrementar contador de respuestas en la encuesta
    survey.responseCount += 1;
    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get responses for a survey
// @route   GET /api/responses/survey/:surveyId
// @access  Private
export const getSurveyResponses = async (req, res) => {
  try {
    const responses = await Response.find({ survey: req.params.surveyId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get survey statistics
// @route   GET /api/responses/survey/:surveyId/stats
// @access  Private
export const getSurveyStats = async (req, res) => {
  try {
    const responses = await Response.find({ survey: req.params.surveyId });
    const survey = await Survey.findById(req.params.surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Calcular estadísticas básicas
    const stats = {
      totalResponses: responses.length,
      responseRate: survey.settings.maxResponses 
        ? (responses.length / survey.settings.maxResponses) * 100 
        : null,
      latestResponse: responses[0]?.createdAt || null,
      averageCompletionTime: null // Se podría calcular con timestamps
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};