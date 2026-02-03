/**
 * Validation Utilities
 * Functions for data validation and formatting for API
 */

/**
 * Validate survey data before submission
 * @param {Object} data - Survey form data
 * @returns {Object} Validation result with {valid: boolean, errors: Array}
 */
export const validateSurveyData = (data) => {
  const errors = [];

  // Check if there are questions
  if (!data.questions || data.questions.length === 0) {
    errors.push('Debes agregar al menos una pregunta');
  }

  // Validate multiple choice questions
  const invalidMultiple = data.questions?.filter(
    q => q.type === 'multiple' && (!q.options || q.options.length < 2)
  );

  if (invalidMultiple && invalidMultiple.length > 0) {
    errors.push('Las preguntas de opción múltiple deben tener al menos 2 opciones');
  }

  // Validate question texts
  const emptyQuestions = data.questions?.filter(q => !q.text || q.text.trim() === '');
  if (emptyQuestions && emptyQuestions.length > 0) {
    errors.push('Todas las preguntas deben tener texto');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate response data before submission
 * @param {Object} data - Response form data
 * @param {Array} requiredQuestionIds - Array of required question IDs
 * @returns {Object} Validation result with {valid: boolean, errors: Array}
 */
export const validateResponseData = (data, requiredQuestionIds = []) => {
  const errors = [];

  // Check email
  if (!data.respondentEmail || data.respondentEmail.trim() === '') {
    errors.push('El email es obligatorio');
  } else if (!isValidEmail(data.respondentEmail)) {
    errors.push('El email no es válido');
  }

  // Check required questions
  const missingAnswers = requiredQuestionIds.filter(
    qId => !data.answers?.[qId] || data.answers[qId] === ''
  );

  if (missingAnswers.length > 0) {
    errors.push(`Por favor responde todas las preguntas obligatorias (${missingAnswers.length} faltantes)`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format survey data for API submission
 * @param {Object} data - Survey form data
 * @param {boolean} publishNow - Whether to publish immediately
 * @returns {Object} Formatted survey data
 */
export const formatSurveyDataForAPI = (data, publishNow = false) => {
  return {
    title: data.title,
    description: data.description,
    status: publishNow ? 'active' : 'draft',
    settings: {
      access: data.settings.access,
      maxResponses: data.settings.maxResponses ? parseInt(data.settings.maxResponses) : undefined,
      startDate: data.settings.startDate,
      endDate: data.settings.endDate
    },
    questions: data.questions.map((q, idx) => ({
      ...q,
      order: idx,
      options: q.type === 'multiple' ? cleanOptions(q.options) : undefined
    }))
  };
};

/**
 * Format response data for API submission
 * @param {Object} data - Response form data
 * @returns {Object} Formatted response data
 */
export const formatResponseDataForAPI = (data) => {
  const formattedAnswers = Object.entries(data.answers || {})
    .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    .map(([questionId, value]) => ({
      questionId,
      value
    }));

  return {
    answers: formattedAnswers,
    respondentEmail: data.respondentEmail.trim()
  };
};

/**
 * Extract error message from error object
 * @param {Error|Object} error - Error object
 * @param {string} defaultMessage - Default message if extraction fails
 * @returns {string} Error message
 */
export const getErrorMessage = (error, defaultMessage = 'Ha ocurrido un error') => {
  return error.response?.data?.message || error.message || defaultMessage;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Clean options array (remove empty strings)
 * @param {Array} options - Options array
 * @returns {Array} Cleaned options array
 */
export const cleanOptions = (options) => {
  if (!options) return [];
  return options.filter(opt => opt && opt.trim() !== '');
};

/**
 * Validate date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} Validation result with {valid: boolean, error: string}
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: true, error: null };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return {
      valid: false,
      error: 'La fecha de fin debe ser posterior a la fecha de inicio'
    };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize string (remove HTML tags and scripts)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate max responses
 * @param {number|string} maxResponses - Max responses value
 * @returns {Object} Validation result with {valid: boolean, error: string}
 */
export const validateMaxResponses = (maxResponses) => {
  if (!maxResponses) {
    return { valid: true, error: null };
  }

  const num = Number(maxResponses);

  if (isNaN(num) || num < 1) {
    return {
      valid: false,
      error: 'El máximo de respuestas debe ser un número mayor a 0'
    };
  }

  return { valid: true, error: null };
};