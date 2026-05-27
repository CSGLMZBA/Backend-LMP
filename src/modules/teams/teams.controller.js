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

export const joinTeam = async (req, res) => {
  try {
    const member = await teamsService.joinTeam(
      req.params.teamId,
      req.user.id,
      req.validatedData.password
    );

    return successResponse(
      res,
      'Team joined successfully',
      member,
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

    if (error.message === 'TEAM_NOT_ACTIVE') {
      return errorResponse(
        res,
        'Team is not active',
        'TEAM_NOT_ACTIVE',
        [],
        400
      );
    }

    if (error.message === 'USER_ALREADY_IN_TEAM') {
      return errorResponse(
        res,
        'User already belongs to this team',
        'USER_ALREADY_IN_TEAM',
        [],
        400
      );
    }

    if (error.message === 'INVALID_TEAM_PASSWORD') {
      return errorResponse(
        res,
        'Invalid team password',
        'INVALID_TEAM_PASSWORD',
        [],
        401
      );
    }

    return errorResponse(res, 'Error joining team');
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const members = await teamsService.getTeamMembers(
      req.params.teamId,
      req.user.id
    );

    return successResponse(
      res,
      'Team members retrieved',
      members
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

    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to view this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }

    return errorResponse(res, 'Error retrieving team members');
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const member = await teamsService.addTeamMember(
      req.params.teamId,
      req.validatedData,
      req.user.id
    );

    return successResponse(
      res,
      'Team member added',
      member,
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

    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to modify this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }

    if (error.message === 'INSUFFICIENT_TEAM_ROLE') {
      return errorResponse(
        res,
        'Insufficient team role',
        'INSUFFICIENT_TEAM_ROLE',
        [],
        403
      );
    }

    if (error.message === 'USER_ALREADY_IN_TEAM') {
      return errorResponse(
        res,
        'User already belongs to this team',
        'USER_ALREADY_IN_TEAM',
        [],
        400
      );
    }

    return errorResponse(res, 'Error adding team member');
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const result = await teamsService.removeTeamMember(
      req.params.teamId,
      req.params.userId,
      req.user.id
    );

    return successResponse(
      res,
      'Team member removed',
      result
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

    if (error.message === 'MEMBER_NOT_FOUND') {
      return errorResponse(
        res,
        'Member not found',
        'MEMBER_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'OWNER_CANNOT_BE_REMOVED') {
      return errorResponse(
        res,
        'Owner cannot be removed',
        'OWNER_CANNOT_BE_REMOVED',
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
        'You do not have permission to modify this team',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error removing team member');
  }
};
