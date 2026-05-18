import { Router } from 'express';
import * as teamsController from './teams.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createTeamSchema, updateTeamSchema } from './teams.schema.js';

const router = Router();

// Protect team routes 
router.use(authMiddleware);

// POST /api/teams/create Create a new team
router.post('/', validate(createTeamSchema), teamsController.createTeam);

// GET /api/teams/myTeams Get all teams that the current user is in
router.get('/', teamsController.getMyTeams);

// GET /api/teams/myTeams/:teamId Get specific team that the user is in
router.get('/:teamId', teamsController.getTeam);


// TO DO:

// PUT /api/teams/update/:teamId Update team
// router.put('/update/:teamId', validate(updateTeamSchema), teamsController.updateTeam);

// DELETE /api/teams/:teamId Delete team
//router.delete('delete/:teamId', teamsController.deleteTeam);

export default router;
