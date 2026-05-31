import * as teamsService from './teams.service.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';
import { recordAudit } from '../../middleware/audit.middleware.js';
import * as notificationsController from '../notifications/notifications.controller.js'

export const createTeam = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const team = await teamsService.createTeam(
      req.validatedData,
      userId
    );

    await recordAudit({
      action: 'create',
      entityType: 'team',
      entityId: team.id,
      userId,
      teamId: team.id,
      details: {
        name: team.name,
      },
    });
    const notifData = 
    {
      title: "Team Created",
      body: `Your team "${team.name}" was succesfully created`,
      type: 2,
    };
    await notificationsController.createNotificationMass(notifData,[userId]);
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
    const team = await teamsService.updateTeam(
      req.params.teamId,
      req.validatedData,
      req.user.id
    );

    await recordAudit({
      action: 'update',
      entityType: 'team',
      entityId: team.id,
      userId: req.user.id,
      teamId: team.id,
      details: {
        fields: Object.keys(req.validatedData)
          .filter((field) => field !== 'password'),
        changedPassword: Boolean(req.validatedData.password),
      },
    });

    return successResponse(
      res,
      'Team updated successfully',
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

    if (
      error.message === 'UNAUTHORIZED_TEAM_ACCESS' ||
      error.message === 'INSUFFICIENT_TEAM_ROLE'
    ) {
      return errorResponse(
        res,
        'You do not have permission to update this team',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error updating team');
  }
};

export const archiveTeam = async (req, res) => {
  try {
    const team = await teamsService.archiveTeam(
      req.params.teamId,
      req.user.id
    );

    await recordAudit({
      action: 'archive',
      entityType: 'team',
      entityId: team.id,
      userId: req.user.id,
      teamId: team.id,
      details: {
        status: team.status,
      },
    });

    return successResponse(
      res,
      'Team archived successfully',
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

    if (error.message === 'TEAM_ALREADY_ARCHIVED') {
      return errorResponse(
        res,
        'Team is already archived',
        'TEAM_ALREADY_ARCHIVED',
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
        'You do not have permission to archive this team',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error archiving team');
  }
};

export const joinTeam = async (req, res) => {
  try {
    const member = await teamsService.joinTeam(
      req.params.teamId,
      req.user.id,
      req.validatedData.password
    );

    await recordAudit({
      action: 'join',
      entityType: 'team_member',
      entityId: member.id,
      userId: req.user.id,
      teamId: req.params.teamId,
      details: {
        joinedUserId: req.user.id,
        role: member.role,
      },
    });

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

    await recordAudit({
      action: 'add_member',
      entityType: 'team_member',
      entityId: member.id,
      userId: req.user.id,
      teamId: req.params.teamId,
      details: {
        addedUserId: member.userId,
        role: member.role,
      },
    });

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

export const updateTeamMemberRole = async (req, res) => {
  try {
    const member = await teamsService.updateTeamMemberRole(
      req.params.teamId,
      req.params.userId,
      req.validatedData.role,
      req.user.id
    );

    await recordAudit({
      action: 'change_member_role',
      entityType: 'team_member',
      entityId: member.id,
      userId: req.user.id,
      teamId: req.params.teamId,
      details: {
        targetUserId: member.userId,
        role: member.role,
      },
    });

    return successResponse(
      res,
      'Team member role updated',
      member
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

    if (error.message === 'LAST_OWNER_ROLE_CANNOT_CHANGE') {
      return errorResponse(
        res,
        'The last owner role cannot be changed',
        'LAST_OWNER_ROLE_CANNOT_CHANGE',
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

    return errorResponse(res, 'Error updating team member role');
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const result = await teamsService.removeTeamMember(
      req.params.teamId,
      req.params.userId,
      req.user.id
    );

    await recordAudit({
      action: 'remove_member',
      entityType: 'team_member',
      entityId: result.memberId,
      userId: req.user.id,
      teamId: req.params.teamId,
      details: {
        removedUserId: result.userId,
        role: result.role,
      },
    });

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

    if (error.message === 'LAST_OWNER_CANNOT_BE_REMOVED') {
      return errorResponse(
        res,
        'The last owner cannot be removed',
        'LAST_OWNER_CANNOT_BE_REMOVED',
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
