import api from './api';

export const responseService = {
  // Submit response -> survey (CON EMAIL)
  async submitResponse(surveyId, data) {
    const response = await api.post('/responses', {
      surveyId,
      answers: data.answers,
      respondentEmail: data.respondentEmail // ✅ NUEVO
    });
    return response.data;
  },

  // Get survey responses (PROTECTED)
  async getSurveyResponses(surveyId) {
    const response = await api.get(`/responses/survey/${surveyId}`);
    return response.data;
  },

  // Get survey statistics
  async getSurveyStats(surveyId) {
    const response = await api.get(`/responses/survey/${surveyId}/stats`);
    return response.data;
  }
};