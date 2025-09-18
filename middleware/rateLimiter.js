const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes 
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
});

module.exports = limiter;