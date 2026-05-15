import * as authService from './auth.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const register = async (req, res) => {
  try {
    const usuario = await authService.register(
      req.validatedData
    );

    return successResponse(
      res,
      'Usuario registrado',
      usuario,
      201
    );
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Theres already a user with that email',
        'EMAIL_ALREADY_EXISTS',
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

    return successResponse(
      res,
      'Login successfull',
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
      'Login error',
      'LOGIN_ERROR',
      [],
      500
    );
  }
};

export const softDelete = async (req, res) => {
  try {
    const { userId } = req.validatedData;

    const result = await authService.softDelete(userId);

    return successResponse(res, 'User erased', result);
  } catch (error) {
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

    const usuario = await authService.update(userId, data);

    return successResponse(
      res,
      'User updated',
      usuario
    );
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Theres already a user with that email',
        'EMAIL_ALREADY_EXISTS',
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
