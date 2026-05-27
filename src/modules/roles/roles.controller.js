import * as rolesService from './roles.service.js';

import {
    successResponse,
    errorResponse,
} from '../../utils/response.js';

export const getRoles = async (req, res) =>
{
  try
  {
    const roles = await rolesService.getRoles();
    return successResponse(
      res,
      'Roles retrieved',
      roles
    );
  }
  catch (error) 
  {
    return errorResponse(
      res,
      'Error gettin roles',
      'ROLES_ERROR',
      [error.message],
      500
    );
  }

}
export const postRole = async (req, res) => {
  try{
    const role = await rolesService.postRole(
      req.validatedData
    );

    return successResponse(
      res,
      'Role posted',
      role,
      201
    );
  }
  catch (error) 
  {
    if (error.message === 'NAME_ALREADY_EXISTS')
    {
      return errorResponse(
        res,
        'Theres already a role with that name',
        error.message,
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

export const putRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await rolesService.putRole(
      roleId, req.validatedData
    );

    return successResponse(
      res,
      'Role put',
      role,
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

export const softDelete = async (req, res) => {
  try {
    const { roleId } = req.params;

    const result = await rolesService.softDelete(roleId);

    return successResponse(res, 'Role erased', result);
  } catch (error) {
    if (error.message === 'ROLE_NOT_FOUND') {
      return errorResponse(
        res,
        'Role not found',
        'ROLE_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'ROLE_ALREADY_DELETED') {
      return errorResponse(
        res,
        'Role already deleted',
        'ROLE_ALREADY_DELETED',
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
