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

// Check if they are the target of an action on themselves
export const authorizeSelf = (paramKey = 'userId') => {
  return (req, res, next) => {
    const userId = req.validatedData?.[paramKey] || req.params?.[paramKey];
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    if (requester.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes acceder a tu propio recurso',
        error: { code: 'FORBIDDEN_SELF' },
      });
    }

    next();
  };
};
// Check if they are an admin
export const authorizeAdmin = () => {
  return (req, res, next) => {
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    if (requester.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Requiere permisos de administrador',
        error: { code: 'FORBIDDEN_ADMIN' },
      });
    }

    next();
  };
};
//check if they are either
export const authorizeSelfOrAdmin = (paramKey = 'userId') => {
  return (req, res, next) => {
    const userId = req.validatedData?.[paramKey] || req.params?.[paramKey];
    const requester = req.user;

    const isOwner = requester.id === userId;
    const isAdmin = requester.rol === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: { code: 'FORBIDDEN' },
      });
    }

    next();
  };
};