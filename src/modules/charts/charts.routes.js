import { Router } from 'express';
import * as chartsController from './charts.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as chartsSchema from './charts.schema.js';

const router = Router();

router.use(authMiddleware(2));


router.post('/', 
    validate(chartsSchema.create), 
    chartsController.createChart);

router.get('/', 
    chartsController.getMyCharts);

router.get('/:chartId', 
    chartsController.getChart);

router.patch('/:chartId', 
    validate(chartsSchema.updateParams, 'params'),
    validate(chartsSchema.update), 
    chartsController.updateChart);

export default router;
