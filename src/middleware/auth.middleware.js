import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { userRepository } from '../modules/auth/auth.repository.js';
import { rolesRepository } from '../modules/roles/roles.repository.js';

const GLOBAL_ROLE_LEVELS = {
  admin: 4,
  user: 2,
  client: 0,
};

const getGlobalRoleLevel = async (roleName) => {
  const normalizedRole = roleName || 'client';
  const role = await rolesRepository.findByNameActive(normalizedRole);

  return role?.roleLevel ?? GLOBAL_ROLE_LEVELS[normalizedRole] ?? 0;
};

export const authMiddleware = (requiredLevel = 0) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
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

      const user = await userRepository.findById(decoded.id);

      if (!user || !user.active) {
        return errorResponse(
          res,
          'User not found',
          'USER_NOT_FOUND',
          [],
          401
        );
      }

      //Token version
      if (decoded.tokenVersion !== user.tokenVersion) {
        return errorResponse(
          res,
          'Token revoked',
          'TOKEN_REVOKED',
          [],
          401
        );
      }

      const role = user.role || decoded.role || 'client';
      const level = await getGlobalRoleLevel(role);

      if (level < requiredLevel) {
        return errorResponse(
          res,
          'not_sufficient_permissions',
          'NOT_SUFFICIENT_PERMISSIONS',
          [],
          403
        );
      }

      req.user = {
        id: user.id,
        displayName: user.displayName,
        userName: user.userName,
        email: user.email,
        role,
        status: user.status,
      };

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
};
