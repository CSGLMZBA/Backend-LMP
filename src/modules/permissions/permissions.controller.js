import * as permissionsService from './permissions.service.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const getPermissions = async (req, res) => {
  try {
    const permissions = permissionsService.getPermissions();

    return successResponse(
      res,
      'Permissions retrieved',
      permissions
    );
  } catch (error) {
    return errorResponse(
      res,
      'Error retrieving permissions',
      'PERMISSIONS_ERROR',
      [error.message],
      500
    );
  }
};
