import * as authService from './auth.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';
import { recordAudit } from '../../middleware/audit.middleware.js';

import * as notificationsController from '../notifications/notifications.controller.js'

export const register = async (req, res) => {
  try {
    const user = await authService.register(
      req.validatedData
    );

    await recordAudit({
      action: 'create',
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      details: {
        source: 'self_register',
        role: user.role,
        email: user.email,
      },
    });

    const notifData = 
    {
      title: "profile Created",
      body: `${user.userName} was created`,
      type: 2,
    };
    await notificationsController.createNotificationMass(notifData,[user.id]);
    return successResponse(
      res,
      'User Registered',
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
    'Register error',
    'INTERNAL_ERROR',
    [error.message],
    500
  );
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(
      req.validatedData
    );

    await recordAudit({
      action: 'login',
      entityType: 'user',
      entityId: result.user.id,
      userId: result.user.id,
      details: {
        email: result.user.email,
        role: result.user.role,
      },
    });

    return successResponse(
      res,
      'Login successfull',
      result
    );
  } catch (error) {
    await recordAudit({
      action: 'login_failed',
      entityType: 'user',
      details: {
        email: req.validatedData?.email,
        reason: error.message,
      },
    });

    if (error.message === 'INVALID_CREDENTIALS') {
      return errorResponse(
        res,
        'Invalid Credentials',
        'INVALID_CREDENTIALS',
        [],
        401
      );
    }

    if (error.message === 'ACCOUNT_LOCKED') {
      return errorResponse(
        res,
        'Account locked due to too many failed login attempts',
        'ACCOUNT_LOCKED',
        [],
        423
      );
    }

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
      'Login error',
      'LOGIN_ERROR',
      [],
      500
    );
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(
        res,
        'Refresh token required',
        'NO_REFRESH_TOKEN',
        [],
        401
      );
    }

    const result = await authService.refresh(refreshToken);

    return successResponse(
      res,
      'Token refreshed',
      result
    );
  } catch (error) {
    return errorResponse(
      res,
      'Invalid refresh token',
      'INVALID_REFRESH_TOKEN',
      [],
      401
    );
  }
};


export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await authService.updatePassword(
      userId,
      req.validatedData
    );

    await recordAudit({
      action: 'sensitive_change',
      entityType: 'user',
      entityId: userId,
      userId,
      details: {
        field: 'password',
      },
    });
    const notifData = 
    {
      title: "Password changed",
      body: `Hello ${result.userName} your password has been changed successfully`,
      type: 2,
    }
    await notificationsController.createNotificationMass(notifData,[userId]);
    return successResponse(
      res,
      'Password Updated succcesfully',
      result
    );
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return errorResponse(
        res,
        'Invalid Credentials',
        'INVALID_CREDENTIALS',
        [],
        401
      );
    }

    return errorResponse(
      res,
      'Password update error',
      'PASSWORD_UPDATE_ERROR',
      [],
      500
    );
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await authService.logout(
      userId
    );

    await recordAudit({
      action: 'logout',
      entityType: 'user',
      entityId: userId,
      userId,
    });

    return successResponse(
      res,
      'Logged out succesfully',
      result
    );
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return errorResponse(
        res,
        'Invalid Credentials',
        'INVALID_CREDENTIALS',
        [],
        401
      );
    }

    return errorResponse(
      res,
      'Logout error',
      'LOGOUT_ERROR',
      [],
      500
    );
  }
};

export const getSelf = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return successResponse(
      res,
      'User info retrieved successfully',
      user
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to get user info',
      'GET_SELF_ERROR',
      [error.message],
      500
    );
  }
};
