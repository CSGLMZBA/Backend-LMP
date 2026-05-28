import { Router } from 'express';
import * as teamsController from './teams.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as teamsSchema from './teams.schema.js';

const router = Router();

// Protect team routes 
router.use(authMiddleware());


// GET /api/teams/myTeams Get all teams that the current user is in
router.get('/', teamsController.getMyTeams);

// GET /api/teams/myTeams/:teamId Get specific team that the user is in
router.get(
  '/:teamId',
  validate(teamsSchema.teamIdParamSchema, 'params'),
  teamsController.getTeam
);

router.patch(
  '/:teamId',
  validate(teamsSchema.teamIdParamSchema, 'params'),
  validate(teamsSchema.update),
  teamsController.updateTeam
);

router.delete(
  '/:teamId',
  validate(teamsSchema.teamIdParamSchema, 'params'),
  teamsController.archiveTeam
);

router.post(
  '/:teamId/join',
  validate(teamsSchema.teamIdParamSchema, 'params'),
  validate(teamsSchema.joinTeamSchema),
  teamsController.joinTeam
);

router.get(
  '/:teamId/members',
  validate(teamsSchema.teamIdParamSchema, 'params'),
  teamsController.getTeamMembers
);

router.post(
  '/:teamId/members',
  validate(teamsSchema.teamIdParamSchema, 'params'),
  validate(teamsSchema.addTeamMemberSchema),
  teamsController.addTeamMember
);

router.patch(
  '/:teamId/members/:userId/role',
  validate(teamsSchema.teamMemberParamsSchema, 'params'),
  validate(teamsSchema.updateTeamMemberRoleSchema),
  teamsController.updateTeamMemberRole
);

router.delete(
  '/:teamId/members/:userId',
  validate(teamsSchema.teamMemberParamsSchema, 'params'),
  teamsController.removeTeamMember
);

router.use(authMiddleware(2));
// POST /api/teams/create Create a new team
router.post('/', validate(teamsSchema.create), teamsController.createTeam);

export default router;
