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
