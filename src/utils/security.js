// 🛡️ Security utilities for frontend protection

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'รหัสผ่านไม่ถูกต้อง' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'รหัสผ่านต้องมีตัวเลข' };
  }

  return { isValid: true, message: 'รหัสผ่านถูกต้อง' };
};

/**
 * Validate phone number (Thai format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid phone
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate name (Thai/English characters only)
 * @param {string} name - Name to validate
 * @returns {boolean} - Is valid name
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Zก-๙\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
};

/**
 * Validate latitude and longitude
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Is valid coordinates
 */
export const validateCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Rate limiting for API calls
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

/**
 * Generate CSRF token
 * @returns {string} - CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @param {string} storedToken - Stored token
 * @returns {boolean} - Is valid token
 */
export const validateCSRFToken = (token, storedToken) => {
  return token && storedToken && token === storedToken;
};
