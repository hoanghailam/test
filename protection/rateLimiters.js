const rateLimit = require('express-rate-limit');

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 120,                // limit each IP to 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please slow down.',
});

// Auth limiter (e.g. /login, /register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // limit each IP to 10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many attempts, please try again later.',
});

module.exports = {
  generalLimiter,
  authLimiter,
};