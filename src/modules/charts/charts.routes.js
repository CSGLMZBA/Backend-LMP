import { Router } from 'express';
import * as chartsController from './charts.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as chartsSchema from './charts.schema.js';

const router = Router();

// Protect team routes 
router.use(authMiddleware);

// POST /api/teams/create Create a new team
router.post('/', 
    validate(chartsSchema.create), 
    chartsController.createChart);

// GET /api/teams/myTeams Get all teams that the current user is in
router.get('/', 
    chartsController.getMyCharts);

// GET /api/teams/myTeams/:teamId Get specific team that the user is in
router.get('/:chartId', 
    chartsController.getChart);

router.patch('/:chartId', 
    validate(chartsSchema.updateParams, 'params'),
    validate(chartsSchema.update), 
    chartsController.updateChart);


// TO DO:

// PUT /api/teams/update/:teamId Update team
// router.put('/update/:teamId', validate(updateTeamSchema), teamsController.updateTeam);

// DELETE /api/teams/:teamId Delete team
//router.delete('delete/:teamId', teamsController.deleteTeam);

export default router;
