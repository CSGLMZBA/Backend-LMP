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
router.get('/:teamId', teamsController.getTeam);

router.post(
  '/:teamId/join',
  validate(teamsSchema.joinTeamSchema),
  teamsController.joinTeam
);

router.get(
  '/:teamId/members',
  teamsController.getTeamMembers
);

router.post(
  '/:teamId/members',
  validate(teamsSchema.addTeamMemberSchema),
  teamsController.addTeamMember
);

router.delete(
  '/:teamId/members/:userId',
  teamsController.removeTeamMember
);

router.use(authMiddleware(2));
// POST /api/teams/create Create a new team
router.post('/', validate(teamsSchema.create), teamsController.createTeam);
// TO DO:

// PUT /api/teams/update/:teamId Update team
// router.put('/update/:teamId', validate(updateTeamSchema), teamsController.updateTeam);

// DELETE /api/teams/:teamId Delete team
//router.delete('delete/:teamId', teamsController.deleteTeam);

export default router;
