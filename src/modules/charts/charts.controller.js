import * as chartsService from './charts.service.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const createChart = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const chart = await chartsService.createChart(
      req.validatedData,
      userId
    );

    return successResponse(
      res,
      'Chart created successfully',
      chart,
      201
    );
  } catch (error) {
    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'PROJECT_NOT_FOUND') {
      return errorResponse(
        res,
        'Project not found',
        'PROJECT_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'PROJECT_TEAM_MISMATCH') {
      return errorResponse(
        res,
        'Project does not belong to this team',
        'PROJECT_TEAM_MISMATCH',
        [],
        400
      );
    }

    if (
      error.message === 'UNAUTHORIZED_TEAM_ACCESS' ||
      error.message === 'INSUFFICIENT_TEAM_ROLE'
    ) {
      return errorResponse(
        res,
        'You do not have permission to create charts for this team',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error creating chart');
  }
};

export const getMyCharts = async (req, res) => {
  try {
    const userId = req.user.id;
    const charts = await chartsService.getChartsByUser(userId);

    return successResponse(
      res,
      'Charts retrieved',
      charts
    );
  } catch (error) {
    return errorResponse(res, 'Error retrieving charts');
  }
};

export const getChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chartId } = req.params;
    const chart = await chartsService.getChartById(chartId, userId);

    return successResponse(
      res,
      'Chart retrieved',
      chart
    );
  } catch (error) {
    if (error.message === 'CHART_NOT_FOUND') {
      return errorResponse(
        res,
        'Chart not found',
        'CHART_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(
        res,
        'You do not have permission to view this chart',
        'UNAUTHORIZED',
        [],
        403
      );
    }
    return errorResponse(res, 'Error retrieving chart');
  }
};

export const updateChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chartId } = req.params;
    const chart = await chartsService.updateChart(
      chartId,
      req.validatedData,
      userId
    );

    return successResponse(
      res,
      'Chart updated successfully',
      chart
    );
  } catch (error) {
    if (error.message === 'CHART_NOT_FOUND') {
      return errorResponse(
        res,
        'Chart not found',
        'CHART_NOT_FOUND',
        [],
        404
      );
    }

    if (
      error.message === 'UNAUTHORIZED_TEAM_ACCESS' ||
      error.message === 'INSUFFICIENT_TEAM_ROLE'
    ) {
      return errorResponse(
        res,
        'You do not have permission to update this chart',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error updating chart');
  }
};
