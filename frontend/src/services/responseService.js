import api from './api';

export const responseService = {
  // Submit response to survey (WITH EMAIL)
  async submitResponse(surveyId, data) {
    console.log('📤 [SERVICE] Submitting response');
    console.log('📤 [SERVICE] surveyId:', surveyId);
    console.log('📤 [SERVICE] data:', data);
    
    const payload = {
      surveyId,  
      answers: data.answers,
      respondentEmail: data.respondentEmail
    };
    
    console.log('📤 [SERVICE] Final payload:', JSON.stringify(payload, null, 2));
    
    const response = await api.post('/responses', payload);
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
