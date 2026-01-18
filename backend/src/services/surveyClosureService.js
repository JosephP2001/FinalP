import cron from 'node-cron';
import Survey from '../models/Survey.js';
import { sendSurveyClosed } from './emailService.js';

// Close Surveys (automatically)
export const closeSurveyIfNeeded = async (survey) => {
  try {
    let shouldClose = false;
    let reason = null;

    const now = new Date();

    // Check closing Date
    if (survey.settings?.endDate && new Date(survey.settings.endDate) < now) {
      shouldClose = true;
      reason = 'date';
    }

    // Responses Limit verificatión
    if (survey.settings?.maxResponses && survey.responseCount >= survey.settings.maxResponses) {
      shouldClose = true;
      reason = 'limit';
    }

    if (shouldClose && survey.status === 'active') {
      survey.status = 'closed';
      await survey.save();

      console.log(`🔒 Encuesta cerrada: ${survey.title} (Motivo: ${reason})`);

      // Sent to author e-mail
      const populatedSurvey = await Survey.findById(survey._id).populate('creator', 'email name');
      
      if (populatedSurvey.creator?.email) {
        await sendSurveyClosed(
          populatedSurvey.creator.email,
          populatedSurvey.title,
          reason,
          {
            totalResponses: populatedSurvey.responseCount,
            maxResponses: populatedSurvey.settings?.maxResponses
          }
        );
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error(' Error cerrando encuesta:', error);
    return false;
  }
};

// Verificar manualmente una encuesta específica
export const checkAndCloseSurvey = async (surveyId) => {
  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new Error('Encuesta no encontrada');
    }
    return await closeSurveyIfNeeded(survey);
  } catch (error) {
    console.error('Error verificando encuesta:', error);
    throw error;
  }
};

// Cron job: ACTIVE survey?  (every 5 min)
export const startAutoClosureJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Verificando encuestas activas para cierre automático...');

      const activeSurveys = await Survey.find({ status: 'active' });

      let closedCount = 0;
      for (const survey of activeSurveys) {
        const wasClosed = await closeSurveyIfNeeded(survey);
        if (wasClosed) closedCount++;
      }

      if (closedCount > 0) {
        console.log(` ${closedCount} encuesta(s) cerrada(s) automáticamente`);
      } else {
        console.log('✓ No hay encuestas para cerrar');
      }
    } catch (error) {
      console.error(' Error en cron job de cierre:', error);
    }
  });

  console.log(' Cron job de cierre automático iniciado (cada 5 minutos)');
};