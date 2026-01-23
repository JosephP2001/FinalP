// frontend/src/services/aiService.js

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
 * AI Service
 * Handles AI-powered analysis using Groq API through backend
 */
export const aiService = {
  /**
   * Analyze full survey with AI
   * @param {string} surveyId - Survey ID
   * @returns {Promise} AI analysis result
   */
  analyzeSurvey: async (surveyId) => {
    try {
      console.log('[AI] Requesting analysis for survey:', surveyId);
      
      const response = await axios.post(
        `${API_URL}/ai/analyze-survey/${surveyId}`,
        {},
        getAuthHeader()
      );

      console.log('[AI] Analysis complete');
      return response.data;
    } catch (error) {
      console.error('[AI] Analysis error:', error);
      throw error;
    }
  }
};

export default aiService;