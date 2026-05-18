import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

// We make sure the user provides a token for the required routes

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(
        res,
        'Token Required',
        'TOKEN_REQUIRED',
        [],
        401
      );
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return errorResponse(
      res,
      'Invalid Token',
      'INVALID_TOKEN',
      [],
      401
    );
  }
};
