import { errorResponse } from '../utils/response.js';
import { env } from '../config/env.js';

const buckets = new Map();

export const createRateLimiter = ({
  windowMs = env.AUTH_RATE_LIMIT_WINDOW_MS,
  maxRequests = env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  keyPrefix = 'rate-limit',
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${req.path}:${ip}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));

      return errorResponse(
        res,
        'Too many requests, please try again later',
        'RATE_LIMIT_EXCEEDED',
        [{ retryAfterSeconds }],
        429
      );
    }

    buckets.set(key, current);

    return next();
  };
};

export const authRateLimiter = createRateLimiter({
  keyPrefix: 'auth',
});
