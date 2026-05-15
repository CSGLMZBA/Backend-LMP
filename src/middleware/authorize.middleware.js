export const authorize = {
  // Check if they are the target of an action on themselves
  self: (paramKey = 'userId') => {
    return (req, res, next) => {
      const userId =
        req.validatedData?.[paramKey] || req.params?.[paramKey];

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
  },

  // Check if they are an admin
  admin: () => {
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
  },

  // Check if they are either owner or admin
  selfOrAdmin: (paramKey = 'userId') => {
    return (req, res, next) => {
      const userId =
        req.validatedData?.[paramKey] || req.params?.[paramKey];

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
  },
};