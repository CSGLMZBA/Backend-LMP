import * as auditService from './audit.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const log = async (info) => {
  try {
    const audit = await auditService.register(
      info
    );

    return {
      message: 'Action Logged',
      info: audit,
      code: 201
    };
  } catch (error) {
    return {
    error: 'Register error',
    errorType: 'INTERNAL_ERROR',
    errorMessage: [error.message],
    errorCode: 500
    };
  }
};


export const get = async (req, res) => {
  try {
    const audit = await auditService.get();
    return successResponse(
      res,
      'Audit info retrieved successfully',
      audit
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to get audit info',
      'GET_ERROR',
      [error.message],
      500
    );
  }
};