/**
 * Statistics Utilities
 * Functions for statistical calculations and data analysis
 */

/**
 * Calculate general statistics from responses
 * @param {Array} responses - Array of response objects
 * @returns {Object} Statistics object
 */
export const calculateStatistics = (responses) => {
  const totalResponses = responses.length;
  
  if (totalResponses === 0) {
    return {
      total: 0,
      averagePerDay: 0,
      latestResponse: null
    };
  }

  // Calculate average responses per day
  const dates = responses.map(r => new Date(r.submittedAt));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  const daysDiff = Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24)) || 1;
  const averagePerDay = totalResponses / daysDiff;

  return {
    total: totalResponses,
    averagePerDay: averagePerDay.toFixed(1),
    latestResponse: latest.toISOString()
  };
};

/**
 * Calculate completion rate
 * @param {Array} responses - Array of response objects
 * @param {Object} survey - Survey object with settings
 * @returns {number} Completion rate percentage
 */
export const calculateCompletionRate = (responses, survey) => {
  if (!survey.settings?.maxResponses) return 100;
  return Math.min(100, ((responses.length / survey.settings.maxResponses) * 100).toFixed(1));
};

/**
 * Get last response date
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
 * Calculate scale statistics (for 1-10 scale questions)
 * @param {Array} values - Array of numeric values
 * @returns {Object} Scale statistics
 */
export const calculateScaleStats = (values) => {
  if (values.length === 0) {
    return { average: 0, min: 0, max: 0, count: 0 };
  }

  const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const average = sum / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  return {
    average: average.toFixed(1),
    min,
    max,
    count: numericValues.length
  };
};

/**
 * Calculate frequency distribution for multiple choice
 * @param {Array} answers - Array of answer strings
 * @param {Array} options - Array of available options
 * @returns {Array} Distribution data for charts
 */
export const calculateFrequencyDistribution = (answers, options) => {
  const counts = {};
  
  // Initialize counts for all options
  options.forEach(opt => {
    counts[opt] = 0;
  });

  // Count occurrences
  answers.forEach(answer => {
    if (counts[answer] !== undefined) {
      counts[answer]++;
    }
  });

  // Convert to array format for charts
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: answers.length > 0 ? ((value / answers.length) * 100).toFixed(1) : 0
  }));
};

/**
 * Group responses by date
 * @param {Array} responses - Array of response objects
 * @returns {Array} Array of {date, count} objects
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

/**
 * Calculate response rate percentage
 * @param {number} responseCount - Number of responses
 * @param {number} maxResponses - Maximum allowed responses
 * @returns {number} Response rate percentage
 */
export const calculateResponseRate = (responseCount, maxResponses) => {
  if (!maxResponses) return 0;
  return Math.min(100, Math.round((responseCount / maxResponses) * 100));
};

/**
 * Get distribution percentages for scale data
 * @param {Array} values - Array of scale values (1-10)
 * @returns {Object} Distribution with percentages for each value
 */
export const getScaleDistribution = (values) => {
  const distribution = {};
  
  // Initialize all values 1-10
  for (let i = 1; i <= 10; i++) {
    distribution[i] = 0;
  }

  // Count occurrences
  values.forEach(val => {
    const num = Number(val);
    if (num >= 1 && num <= 10) {
      distribution[num]++;
    }
  });

  // Convert to percentage
  const total = values.length;
  const result = {};
  
  for (let i = 1; i <= 10; i++) {
    result[i] = {
      count: distribution[i],
      percentage: total > 0 ? ((distribution[i] / total) * 100).toFixed(1) : 0
    };
  }

  return result;
};

/**
 * Calculate median value
 * @param {Array} values - Array of numeric values
 * @returns {number} Median value
 */
export const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/**
 * Calculate mode (most frequent value)
 * @param {Array} values - Array of values
 * @returns {*} Most frequent value
 */
export const calculateMode = (values) => {
  if (values.length === 0) return null;
  
  const frequency = {};
  let maxFreq = 0;
  let mode = values[0];

  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });

  return mode;
};