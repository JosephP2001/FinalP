import api from './api';

export const surveyService = {
  // Get all surveys
  async getAllSurveys() {
    const response = await api.get('/surveys');
    return response.data;
  },

  // Get SINGLE
  async getSurvey(id) {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  // Get PLURAL
  async getMySurveys() {
    const response = await api.get('/surveys/my/surveys');
    return response.data;
  },

  //CRUD
  async createSurvey(surveyData) {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  },

  async updateSurvey(id, surveyData) {
    const response = await api.put(`/surveys/${id}`, surveyData);
    return response.data;
  },

  async deleteSurvey(id) {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  }
};