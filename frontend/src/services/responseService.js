// frontend/src/services/responseService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * Response Service
 * Handles all response-related API calls
 */
export const responseService = {
  /**
   * Submit a response to a survey
   * @param {string} surveyId - Survey ID
   * @param {Object} data - Response data (answers, respondentEmail)
   * @returns {Promise} Response data
   */
  submitResponse: async (surveyId, data) => {
    try {
      console.log('[SERVICE] Submitting response');
      console.log('[SERVICE] surveyId:', surveyId);
      console.log('[SERVICE] data:', data);

      const payload = {
        surveyId,
        ...data
      };

      console.log('[SERVICE] Final payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${API_URL}/responses`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error('[SERVICE] Submit response error:', error);
      throw error;
    }
  },

  /**
   * Get all responses for a survey
   * @param {string} surveyId - Survey ID
   * @returns {Promise} Array of responses
   */
  getSurveyResponses: async (surveyId) => {
    try {
      const response = await axios.get(
        `${API_URL}/responses/survey/${surveyId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Get survey responses error:', error);
      throw error;
    }
  },

  /**
   * Get statistics for a survey
   * @param {string} surveyId - Survey ID
   * @returns {Promise} Survey statistics
   */
  getSurveyStats: async (surveyId) => {
    try {
      const response = await axios.get(
        `${API_URL}/responses/survey/${surveyId}/stats`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Get survey stats error:', error);
      throw error;
    }
  }
};

export default responseService;