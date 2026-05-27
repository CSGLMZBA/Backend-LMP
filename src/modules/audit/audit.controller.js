import * as auditService from './audit.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const log = async (req, res) => {
  try {
    const audit = await auditService.register(
      req
    );

    return successResponse(
      res,
      'Action Logged',
      audit,
      201
    );
  } catch (error) {
    return errorResponse(
    res,
    'Register error',
    'INTERNAL_ERROR',
    [error.message],
    500
  );
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