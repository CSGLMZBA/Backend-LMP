import * as usersService from './users.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const postUser = async (req, res) => {
  try {
    const usuario = await usersService.postUser(
      req.validatedData
    );

    return successResponse(
      res,
      'User posted',
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
    const usuario = await usersService.putUser(
      userId, req.validatedData
    );

    return successResponse(
      res,
      'User put',
      usuario,
      201
    );
  } catch (error) {

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
    
    const user = await usersService.update(userId, req.validatedData)
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
    return errorResponse(res, 'Error patching user status');
  }
};

export const patchStatus = async (req, res) => {
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


export const softDelete = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await usersService.softDelete(userId);

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

    const usuario = await usersService.update(userId, data);

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
