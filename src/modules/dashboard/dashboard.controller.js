import * as dashboardService from './dashboard.service.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const getSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getSummary(req.user.id);

    return successResponse(
      res,
      'Dashboard summary retrieved',
      summary
    );
  } catch (error) {
    return errorResponse(
      res,
      'Error retrieving dashboard summary',
      'DASHBOARD_SUMMARY_ERROR',
      [error.message],
      500
    );
  }
};
