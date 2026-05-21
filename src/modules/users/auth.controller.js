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

export const getUsers = async (req, res) =>
{
  try
  {
    const users = await authService.getUsers();
    return successResponse(
      res,
      'Users retrieved',
      users
    );
  }
  catch (error) 
  {
    return errorResponse(
      res,
      'Error gettin users',
      'USERS_ERROR',
      [error.message],
      500
    );
  }

}

export const getUser = async (req, res) => {
try {
    const { userId } = req.params;
    
    const user = await authService.getUserById(userId);
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
