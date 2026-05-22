import { Router } from 'express';
import * as rolesController from './roles.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as rolesSchema from './roles.schema.js';

const router = Router();

router.use(authMiddleware);//make it so this is exclusive to admins

router.get('/',rolesController.getRoles);
//router.post('/', validate(rolesSchema.create), rolesController.createTeam);


export default router;
