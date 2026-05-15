import * as teamsService from './teams.service.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const createTeam = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const team = await teamsService.createTeam(
      req.validatedData,
      userId
    );

    return successResponse(
      res,
      'Team created successfully',
      team,
      201
    );
  } catch (error) {
    return errorResponse(res, 'Error creating team');
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await teamsService.getTeamsByUser(userId);

    return successResponse(
      res,
      'Teams retrieved',
      teams
    );
  } catch (error) {
    return errorResponse(res, 'Error retrieving teams');
  }
};

export const getTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;
    const team = await teamsService.getTeamById(teamId, userId);

    return successResponse(
      res,
      'Team retrieved',
      team
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
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(
        res,
        'You do not have permission to view this team',
        'UNAUTHORIZED',
        [],
        403
      );
    }
    return errorResponse(res, 'Error retrieving team');
  }
};

export const updateTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;
    const updatedTeam = await teamsService.updateTeam(
      teamId,
      req.validatedData,
      userId
    );

    return successResponse(
      res,
      'Team updated',
      updatedTeam
    );
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(
        res,
        'You do not have permission to update this team',
        'UNAUTHORIZED',
        [],
        403
      );
    }
    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }
    return errorResponse(res, 'Error updating team');
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;
    const result = await teamsService.deleteTeam(teamId, userId);

    return successResponse(
      res,
      'Team deleted',
      result
    );
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(
        res,
        'You do not have permission to delete this team',
        'UNAUTHORIZED',
        [],
        403
      );
    }
    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }
    return errorResponse(res, 'Error deleting team');
  }
};