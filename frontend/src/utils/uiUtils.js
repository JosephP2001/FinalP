/**
 * UI Utilities
 * Functions for UI interactions and formatting
 */

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {string} successMessage - Success message to show (optional)
 */
export const copyToClipboard = async (text, successMessage = '¡Copiado al portapapeles!') => {
  try {
    await navigator.clipboard.writeText(text);
    alert(successMessage);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Error al copiar');
  }
};

/**
 * Generate share link for survey
 * @param {string} surveyId - Survey ID
 * @returns {string} Full survey URL
 */
export const generateShareLink = (surveyId) => {
  return `${window.location.origin}/surveys/${surveyId}/respond`;
};

/**
 * Copy survey share link to clipboard
 * @param {string} surveyId - Survey ID
 */
export const copyShareLink = (surveyId) => {
  const link = generateShareLink(surveyId);
  copyToClipboard(link, '¡Enlace copiado al portapapeles!');
};

/**
 * Get first name from full name
 * @param {string} fullName - Full name string
 * @returns {string} First name
 */
export const getFirstName = (fullName) => {
  if (!fullName) return 'Usuario';
  return fullName.split(' ')[0];
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials in uppercase
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
};

/**
 * Truncate text to maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @param {string} locale - Locale code (default: 'es-EC')
 * @returns {string} Formatted number
 */
export const formatNumber = (num, locale = 'es-EC') => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Get color classes for sentiment
 * @param {string} sentiment - Sentiment value (positive, negative, neutral)
 * @returns {string} Tailwind CSS classes
 */
export const getSentimentColor = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
    case 'positivo':
      return 'text-green-600 bg-green-50';
    case 'negative':
    case 'negativo':
      return 'text-red-600 bg-red-50';
    case 'neutral':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

/**
 * Scroll to top of page smoothly
 */
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};