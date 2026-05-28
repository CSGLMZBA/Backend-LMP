import * as usersService from './users.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';
import { recordAudit } from '../../middleware/audit.middleware.js';

export const postUser = async (req, res) => {
  try {
    const user = await usersService.postUser(
      req.validatedData
    );

    await recordAudit({
      action: 'create',
      entityType: 'user',
      entityId: user.id,
      userId: req.user.id,
      details: {
        source: 'admin_users',
        createdRole: user.role,
        email: user.email,
      },
    });

    return successResponse(
      res,
      'User posted',
      user,
      201
    );
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_IN_USE') {
      return errorResponse(
        res,
        'Theres already a user with that email',
        'EMAIL_ALREADY_IN_USE',
        [],
        400
      );
    }

    if (error.message === 'USERNAME_ALREADY_IN_USE') {
      return errorResponse(
        res,
        'Theres already a user with that username',
        'USERNAME_ALREADY_IN_USE',
        [],
        400
      );
    }

    return errorResponse(
    res,
    'Post error',
    'INTERNAL_ERROR',
    [error.message],
    500
  );
  }
};

export const putUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await usersService.putUser(
      userId, req.validatedData
    );

    await recordAudit({
      action: 'update',
      entityType: 'user',
      entityId: userId,
      userId: req.user.id,
      details: {
        fields: Object.keys(req.validatedData)
          .filter((field) => field !== 'password'),
        changedPassword: Boolean(req.validatedData.password),
      },
    });

    return successResponse(
      res,
      'User put',
      user,
      201
    );
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(
        res,
        'User not found',
        'USER_NOT_FOUND',
        [],
        404
      );
    }

    return errorResponse(
    res,
    'Put error',
    'INTERNAL_ERROR',
    [error.message],
    500
  );
  }
};


export const getUsers = async (req, res) =>
{
  try
  {
    const users = await usersService.getUsers();
    return successResponse(
      res,
      'Users retrieved',
      users
    );
  }
  catch (error) 
  {
    if (error.message === 'USER_DATABASE_EMPTY') {
      return successResponse(
        res,
        'Users retrieved',
        []
      );
    }

    return errorResponse(
      res,
      'Error gettin users',
      'USERS_ERROR',
      [error.message],
      500
    );
  }

}

export const patchStatus = async (req, res) => {
try {
    const { userId } = req.params;
    
    const user = await usersService.update(userId, req.validatedData)

    await recordAudit({
      action: 'status_change',
      entityType: 'user',
      entityId: userId,
      userId: req.user.id,
      details: {
        status: req.validatedData.status,
      },
    });

    return successResponse(
      res,
      'User status patched',
      user
    );
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(
        res,
        'User not found',
        'USER_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'USERNAME_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Theres already a user with that username',
        'USERNAME_ALREADY_EXISTS',
        [],
        400
      );
    }
    if (error.message === 'EMAIL_ALREADY_IN_USE') {
      return errorResponse(
        res,
        'Theres already a user with that email',
        'EMAIL_ALREADY_IN_USE',
        [],
        400
      );
    }
    return errorResponse(res, 'Error patching user status');
  }
};

export const getUser = async (req, res) => {
try {
    const { userId } = req.params;
    
    const user = await usersService.getUserById(userId);
    return successResponse(
      res,
      'User retrieved',
      user
    );
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(
        res,
        'User not found',
        'USER_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(
        res,
        'You do not have permission to view this user',
        'UNAUTHORIZED',
        [],
        403
      );
    }
    return errorResponse(res, 'Error retrieving user');
  }
};
export const getByUserName = async (req, res) => {
try {
    const userName = req.validatedData.userName;
    
    const user = await usersService.getByUserName(userName);
    return successResponse(
      res,
      'User retrieved',
      user
    );
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(
        res,
        'User not found',
        'USER_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(
        res,
        'You do not have permission to view this user',
        'UNAUTHORIZED',
        [],
        403
      );
    }
    return errorResponse(res, 'Error retrieving user');
  }
};

export const unlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await usersService.unlockUser(userId);

    await recordAudit({
      action: 'sensitive_change',
      entityType: 'user',
      entityId: userId,
      userId: req.user.id,
      details: {
        change: 'unlock_user',
      },
    });

    return successResponse(
      res,
      'User unlocked successfully',
      user
    );
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(
        res,
        'User not found',
        'USER_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'USER_NOT_LOCKED') {
      return errorResponse(
        res,
        'User is not locked',
        'USER_NOT_LOCKED',
        [],
        400
      );
    }

    return errorResponse(
      res,
      'Error unlocking user',
      'UNLOCK_USER_ERROR',
      [error.message],
      500
    );
  }
};

export const softDelete = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await usersService.softDelete(userId);

    await recordAudit({
      action: 'delete',
      entityType: 'user',
      entityId: userId,
      userId: req.user.id,
      details: {
        softDelete: true,
      },
    });

    return successResponse(res, 'User erased', result);
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(
        res,
        'User not found',
        'USER_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'USER_ALREADY_DELETED') {
      return errorResponse(
        res,
        'User already deleted',
        'USER_ALREADY_DELETED',
        [],
        400
      );
    }

    return errorResponse(
      res,
      'Error deleting',
      'DELETE_ERROR',
      [error.message],
      500
    );
  }
};

export const update = async (req, res) => {
  try {
    const { userId } = req.params;  
    const data = req.validatedData; 

    const usuario = await usersService.update(userId, data);

    await recordAudit({
      action: 'update',
      entityType: 'user',
      entityId: userId,
      userId: req.user.id,
      details: {
        fields: Object.keys(data).filter((field) => field !== 'password'),
        changedPassword: Boolean(data.password),
      },
    });

    return successResponse(
      res,
      'User updated',
      usuario
    );
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_IN_USE') {
      return errorResponse(
        res,
        'Theres already a user with that email',
        'EMAIL_ALREADY_IN_USE',
        [],
        400
      );
    }

    if (error.message === 'USERNAME_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Theres already a user with that username',
        'USERNAME_ALREADY_EXISTS',
        [],
        400
      );
    }

    return errorResponse(
      res,
      'Update error',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};
