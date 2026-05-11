/**
 * Utility functions for Hidhaya AI Backend
 */

// Sanitize user input to prevent injection attacks
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate query length
const validateQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query is required' };
  }

  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Query must be at least 2 characters' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Query must be less than 1000 characters' };
  }

  return { valid: true };
};

// Validate language parameter
const validateLanguage = (language) => {
  const validLanguages = ['english', 'hindi', 'urdu', 'bengali', 'roman_urdu'];
  return validLanguages.includes(language) ? language : 'english';
};

// Format error response
const formatError = (error, isDevelopment = false) => {
  return {
    error: true,
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: error.stack })
  };
};

// Format success response
const formatSuccess = (data, message = null) => {
  return {
    success: true,
    ...(message && { message }),
    ...data
  };
};

// Parse pagination parameters
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(12).toString('hex');
};

// Get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};

// Sleep utility for retry logic
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry with exponential backoff
const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
};

// Format date for display
const formatDate = (date, locale = 'en') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Truncate text
const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

// Deep clone object
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Check if running in production
const isProduction = () => process.env.NODE_ENV === 'production';

// Rate limit helper
const getRateLimitInfo = (headers) => {
  return {
    limit: parseInt(headers['x-ratelimit-limit']) || null,
    remaining: parseInt(headers['x-ratelimit-remaining']) || null,
    reset: headers['x-ratelimit-reset'] || null
  };
};

module.exports = {
  sanitizeInput,
  validateQuery,
  validateLanguage,
  formatError,
  formatSuccess,
  parsePagination,
  generateUniqueId,
  getClientIP,
  sleep,
  retry,
  formatDate,
  truncate,
  deepClone,
  isProduction,
  getRateLimitInfo
};