/**
 * Date Utilities
 * Centralized date and time manipulation functions
 */

/**
 * Get time elapsed from a date
 * @param {string|Date} date - The date to calculate from
 * @returns {string} Human-readable time ago
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const created = new Date(date);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
};

/**
 * Get greeting based on time of day
 * @returns {string} Greeting message
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

/**
 * Combine date and time strings into ISO format
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} time - Time string (HH:MM)
 * @returns {string|null} ISO date string or null
 */
export const combineDateAndTime = (date, time) => {
  if (!date) return null;
  
  const timeValue = time || '00:00';
  const dateTimeString = `${date}T${timeValue}:00`;
  const dateObj = new Date(dateTimeString);
  
  return dateObj.toISOString();
};

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale code (default: 'es-EC')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'es-EC') => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date to ISO date format (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} ISO date string or empty string
 */
export const formatDateISO = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Get last response date from responses array
 * @param {Array} responses - Array of response objects
 * @returns {string} Formatted last response date
 */
export const getLastResponseDate = (responses) => {
  if (responses.length === 0) return 'N/A';
  const dates = responses.map(r => new Date(r.submittedAt));
  const latest = new Date(Math.max(...dates));
  return latest.toLocaleDateString('es-EC', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Group responses by date
 * @param {Array} responses - Array of response objects
 * @returns {Object} Object with dates as keys and counts as values
 */
export const groupResponsesByDate = (responses) => {
  const dateCounts = {};
  responses.forEach(r => {
    const date = new Date(r.submittedAt).toLocaleDateString('es-EC');
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  
  return Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};