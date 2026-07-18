import rateLimit from "express-rate-limit";

// Rate limiter for generation tasks (computationally heavy / costly)
export const aiGenerateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 10, // Limit each IP to 10 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many question generation requests from this IP. Please try again after 15 minutes."
    }
});

// Rate limiter for submitting answers (slightly higher allowance for natural pacing)
export const aiSubmitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 30, // Limit each IP to 30 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Submission rate limit exceeded. Please wait a moment before sending more responses."
    }
});