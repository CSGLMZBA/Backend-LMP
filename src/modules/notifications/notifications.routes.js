import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { notificationsSchema } from './notifications.schema.js';

const router = Router();

router.use(authMiddleware(0));

router.get('/', notificationsController.getNotifications);
router.patch('/:notificationId/read', validate(notificationsSchema.notificationParams, 'params'), notificationsController.markAsRead);
router.patch('/:notificationId/unread', validate(notificationsSchema.notificationParams, 'params'), notificationsController.markAsUnread);
router.get('/:notificationId', validate(notificationsSchema.notificationParams, 'params'), notificationsController.getNotificationById);
router.delete('/:notificationId', validate(notificationsSchema.notificationParams, 'params'), notificationsController.deleteNotification);

export default router;
