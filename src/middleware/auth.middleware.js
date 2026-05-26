import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { userRepository } from '../modules/auth/auth.repository.js';
import { rolesRepository } from '../modules/roles/roles.repository.js';
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

      const role = await rolesRepository.findByNameActive(decoded.role);

      
      if (!role)
      {
        return errorResponse(
          res,
          'Role not found',
          'ROLE_NOT_FOUND',
          [],
          401
        );
      }
      const level = role.roleLevel;
      if(level<requiredLevel)
      {
        return errorResponse(
          res,
          'not_sufficient_permissions',
          'NOT_SUFFICIENT_PERMISSIONS',
          [],
          401
        );
      }
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

      req.user = {
        id: user.id,
        rol: user.rol,
        userName: user.userName,
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