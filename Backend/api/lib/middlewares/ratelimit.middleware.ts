import rateLimit from 'express-rate-limit';

export const flagVerifyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        status: false,
        message: 'Something was wrong.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            status: false,
            message: 'Something was wrong.'
        });
    }
});

export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: false,
        message: 'Something was wrong.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default flagVerifyRateLimiter;
