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
 * AI Service with Rate Limit Support
 * Handles AI-powered analysis using Groq API through backend
 */
export const aiService = {
  /**
   * Get current rate limit status
   * @returns {Promise} Rate limit status
   */
  getRateLimitStatus: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ai/rate-limit-status`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('[AI] Rate limit status error:', error);
      return null;
    }
  },

  /**
   * Analyze full survey with AI
   * @param {string} surveyId - Survey ID
   * @returns {Promise} AI analysis result with rate limit info
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
      console.log('[AI] Rate limit info:', response.data.rateLimitInfo);
      
      return response.data;
    } catch (error) {
      console.error('[AI] Analysis error:', error);
      
      // Handle rate limit errors specially
      if (error.response?.status === 429) {
        const rateLimitError = error.response.data;
        
        // Create user-friendly error message
        throw {
          isRateLimitError: true,
          type: rateLimitError.error,
          message: rateLimitError.message,
          retryAfter: rateLimitError.retryAfter,
          limit: rateLimitError.limit
        };
      }
      
      throw error;
    }
  }
};

export default aiService;