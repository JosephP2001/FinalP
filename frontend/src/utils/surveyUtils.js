/**
 * Survey Utilities
 * Functions for survey management and status handling
 */

/**
 * Get status badge configuration
 * @param {string} status - Survey status (active, closed, draft)
 * @returns {Object} Badge configuration object
 */
export const getStatusBadge = (status) => {
  const badges = {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'ACTIVA' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'CERRADA' },
    draft: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'BORRADOR' }
  };
  return badges[status] || badges.draft;
};

/**
 * Calculate completion percentage
 * @param {number} responseCount - Current response count
 * @param {number} maxResponses - Maximum allowed responses
 * @returns {number} Percentage (0-100)
 */
export const calculateCompletionPercentage = (responseCount, maxResponses) => {
  if (!maxResponses) return 0;
  return Math.min(100, Math.round((responseCount / maxResponses) * 100));
};

/**
 * Calculate average response rate across surveys
 * @param {Array} surveys - Array of survey objects
 * @returns {number} Average response rate percentage
 */
export const calculateAverageResponseRate = (surveys) => {
  const surveysWithMax = surveys.filter(s => s.settings?.maxResponses);
  
  if (surveysWithMax.length === 0) return 0;
  
  const totalRate = surveysWithMax.reduce((sum, s) => {
    const rate = (s.responseCount / s.settings.maxResponses) * 100;
    return sum + rate;
  }, 0);
  
  return Math.round(totalRate / surveysWithMax.length);
};

/**
 * Check if survey is accessible
 * @param {Object} survey - Survey object
 * @returns {Object} Object with accessible boolean and reason string
 */
export const checkSurveyAccess = (survey) => {
  // Check if survey is active
  if (survey.status !== 'active') {
    return {
      accessible: false,
      reason: 'Esta encuesta no está disponible actualmente'
    };
  }

  const now = new Date();

  // Check start date
  if (survey.settings?.startDate && new Date(survey.settings.startDate) > now) {
    return {
      accessible: false,
      reason: 'Esta encuesta aún no ha comenzado'
    };
  }

  // Check end date
  if (survey.settings?.endDate && new Date(survey.settings.endDate) < now) {
    return {
      accessible: false,
      reason: 'Esta encuesta ha finalizado'
    };
  }

  // Check max responses
  if (survey.settings?.maxResponses && survey.responseCount >= survey.settings.maxResponses) {
    return {
      accessible: false,
      reason: 'Esta encuesta ha alcanzado el límite de respuestas'
    };
  }

  return {
    accessible: true,
    reason: null
  };
};

/**
 * Generate survey share URL
 * @param {string} surveyId - Survey ID
 * @returns {string} Full survey URL
 */
export const generateShareLink = (surveyId) => {
  return `${window.location.origin}/surveys/${surveyId}/respond`;
};

/**
 * Get survey status label in Spanish
 * @param {string} status - Survey status
 * @returns {string} Spanish label
 */
export const getStatusLabel = (status) => {
  const labels = {
    active: 'Activa',
    closed: 'Cerrada',
    draft: 'Borrador'
  };
  return labels[status] || 'Desconocido';
};