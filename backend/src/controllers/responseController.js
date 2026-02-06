import Response from '../models/Response.js';
import Survey from '../models/Survey.js';
import User from '../models/User.js';
import { closeSurveyIfNeeded } from '../services/surveyClosureService.js';
import { sendAlreadyResponded } from '../services/emailService.js';

// @desc    Submit response to survey
// @route   POST /api/responses
// @access  Public
export const submitResponse = async (req, res) => {
  try {
    const { surveyId, answers, respondentEmail } = req.body;

    // Validate email
    if (!respondentEmail) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio para responder'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(respondentEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Verify user exists in database
    const user = await User.findOne({ email: respondentEmail.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Debes estar registrado en el sistema para responder esta encuesta'
      });
    }

    // Find survey
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Encuesta no encontrada'
      });
    }

    // Check status
    if (survey.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Esta encuesta no está activa'
      });
    }

    // Check dates
    const now = new Date();
    if (survey.settings?.startDate && new Date(survey.settings.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: 'Esta encuesta aún no ha comenzado'
      });
    }
    if (survey.settings?.endDate && new Date(survey.settings.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'Esta encuesta ha finalizado'
      });
    }

    // Check response limit BEFORE creating response
    if (survey.settings?.maxResponses && survey.responseCount >= survey.settings.maxResponses) {
      return res.status(400).json({
        success: false,
        message: 'Esta encuesta ha alcanzado el límite de respuestas'
      });
    }

    // Check if email already responded
    const hasResponded = await Response.hasResponded(surveyId, respondentEmail);
    
    if (hasResponded) {
      await sendAlreadyResponded(respondentEmail, survey.title);
      
      return res.status(400).json({
        success: false,
        message: 'Ya has respondido esta encuesta con este email. Solo se permite una respuesta por persona.'
      });
    }

    // Create response
    const response = new Response({
      surveyId,
      respondentEmail: respondentEmail.toLowerCase(),
      answers,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await response.save();

    // Increment counter and save
    survey.responseCount = (survey.responseCount || 0) + 1;
    await survey.save();

    console.log(`Response saved. New count: ${survey.responseCount}/${survey.settings?.maxResponses || '∞'}`);

    // Check if should auto-close
    await closeSurveyIfNeeded(survey);

    res.status(201).json({
      success: true,
      message: 'Respuesta enviada exitosamente',
      data: {
        responseId: response._id,
        submittedAt: response.submittedAt
      }
    });
  } catch (error) {
    // Duplicate error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya has respondido esta encuesta'
      });
    }

    console.error('Error submitting response:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar respuesta'
    });
  }
};

// @desc    Get responses for a survey
// @route   GET /api/responses/survey/:surveyId
// @access  Private
export const getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Encuesta no encontrada'
      });
    }

    // Verify ownership
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estas respuestas'
      });
    }

    const responses = await Response.find({ surveyId })
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: responses
    });
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener respuestas'
    });
  }
};

// @desc    Get survey statistics
// @route   GET /api/responses/survey/:surveyId/stats
// @access  Private
export const getSurveyStats = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Encuesta no encontrada'
      });
    }

    // Verify ownership
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estas estadísticas'
      });
    }

    const responses = await Response.find({ surveyId });

    // Calculate statistics per question
    const questionStats = {};

    responses.forEach(response => {
      response.answers.forEach(answer => {
        const qId = answer.questionId.toString();
        
        if (!questionStats[qId]) {
          questionStats[qId] = {
            values: [],
            count: 0
          };
        }

        questionStats[qId].values.push(answer.value);
        questionStats[qId].count += 1;
      });
    });

    // Calculate response rate
    let responseRate = 0;
    if (survey.settings?.maxResponses && survey.settings.maxResponses > 0) {
      responseRate = (responses.length / survey.settings.maxResponses) * 100;
    }

    // Get last response date properly sorted
    const lastResponse = responses.length > 0 
      ? responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0].submittedAt
      : null;

    res.json({
      success: true,
      data: {
        totalResponses: responses.length,
        uniqueRespondents: responses.length,
        questionStats,
        responseRate,
        latestResponse: lastResponse
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};