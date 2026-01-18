import Response from '../models/Response.js';
import Survey from '../models/Survey.js';
import { closeSurveyIfNeeded } from '../services/surveyClosureService.js';
import { sendAlreadyResponded } from '../services/emailService.js';

// @desc    Submit response to survey
// @route   POST /api/responses
// @access  Public
export const submitResponse = async (req, res) => {
  try {
    const { surveyId, answers, respondentEmail } = req.body;

    // Validar email
    if (!respondentEmail) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio para responder'
      });
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(respondentEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Buscar encuesta
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Encuesta no encontrada'
      });
    }

    // Verificar estado
    if (survey.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Esta encuesta no está activa'
      });
    }

    // Verificar fechas
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

    // Verificar límite de respuestas
    if (survey.settings?.maxResponses && survey.responseCount >= survey.settings.maxResponses) {
      return res.status(400).json({
        success: false,
        message: 'Esta encuesta ha alcanzado el límite de respuestas'
      });
    }

    // ✅ VERIFICAR SI EL EMAIL YA RESPONDIÓ
    const hasResponded = await Response.hasResponded(surveyId, respondentEmail);
    
    if (hasResponded) {
      // Enviar email de notificación
      await sendAlreadyResponded(respondentEmail, survey.title);
      
      return res.status(400).json({
        success: false,
        message: 'Ya has respondido esta encuesta con este email. Solo se permite una respuesta por persona.'
      });
    }

    // Crear respuesta
    const response = new Response({
      surveyId,
      respondentEmail: respondentEmail.toLowerCase(),
      answers,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await response.save();

    // Incrementar contador
    survey.responseCount += 1;
    await survey.save();

    // ✅ VERIFICAR SI DEBE CERRARSE AUTOMÁTICAMENTE
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
    // Error de duplicado (por si falla la validación previa)
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

    // Verificar ownership
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

    // Verificar ownership
    if (survey.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estas estadísticas'
      });
    }

    const responses = await Response.find({ surveyId });

    // Calcular estadísticas por pregunta
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

    res.json({
      success: true,
      data: {
        totalResponses: responses.length,
        uniqueRespondents: responses.length, // Ahora es único por email
        questionStats,
        lastResponse: responses.length > 0 ? responses[responses.length - 1].submittedAt : null
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