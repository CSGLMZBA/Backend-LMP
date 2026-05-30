import * as notificationsService from './notifications.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { recordAudit } from '../../middleware/audit.middleware.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationsService.getNotificationsForRecipient(req.user.id);
    return successResponse(
      res,
      'Notifications retrieved successfully',
      notifications
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to get notifications',
      'GET_NOTIFICATIONS_ERROR',
      [error.message],
      500
    );
  }
};
export const patchNotificationsAsRead = async (req, res) => {
  try {
    const notifications = await notificationsService.readNotificationsForRecipient(req.user.id);

    await recordAudit({
      action: 'read_all',
      entityType: 'notification',
      userId: req.user.id,
      details: {
        count: notifications.filter((notification) => notification.read).length,
      },
    });

    return successResponse(
      res,
      'Notifications Read successfully',
      notifications
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to read notifications',
      'READ_NOTIFICATIONS_ERROR',
      [error.message],
      500
    );
  }
};
export const getNotificationById = async (req, res) => {
  try {
    const notification = await notificationsService.getNotificationById(req.params.notificationId,
      req.user.id);
    return successResponse(
      res,
      'Notification retrieved successfully',
      notification
    );
  } catch (error) {
    if (error.message === 'NOTIFICATION_NOT_FOUND') {
      return errorResponse(res, 'Notification not found', 'NOTIFICATION_NOT_FOUND', [], 404);
    }
    if (error.message === 'NOTIFICATION_UNAUTHORIZED') {
      return errorResponse(res, 'Unauthorized', 'NOTIFICATION_UNAUTHORIZED', [], 403);
    }
    return errorResponse(res, 'Failed to get notification', 'GET_NOTIFICATION_ERROR', [error.message], 500);
  }
};
export const createNotification = async (data) => {
  try {
    const notification = await notificationsService.createNotification(data);

    return {
      message: 'Notification Created',
      info: notification,
      code: 201
    };
  } catch (error) {
    return {
    error: 'Notification create error',
    errorType: 'INTERNAL_ERROR',
    errorMessage: [error.message],
    errorCode: 500
    };
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationsService.setNotificationReadStatus(
      req.params.notificationId,
      req.user.id,
      true
    );

    await recordAudit({
      action: 'mark_read',
      entityType: 'notification',
      entityId: notification.id,
      userId: req.user.id,
      teamId: notification.teamId || '',
      chartId: notification.chartId || '',
      taskId: notification.taskId || '',
      details: {
        projectId: notification.projectId || '',
      },
    });

    return successResponse(
      res,
      'Notification marked as read',
      notification
    );
  } catch (error) {
    if (error.message === 'NOTIFICATION_NOT_FOUND') {
      return errorResponse(res, 'Notification not found', 'NOTIFICATION_NOT_FOUND', [], 404);
    }
    if (error.message === 'NOTIFICATION_UNAUTHORIZED') {
      return errorResponse(res, 'Unauthorized', 'NOTIFICATION_UNAUTHORIZED', [], 403);
    }

    return errorResponse(res, 'Failed to mark notification as read', 'UPDATE_NOTIFICATION_ERROR', [error.message], 500);
  }
};

export const markAsUnread = async (req, res) => {
  try {
    const notification = await notificationsService.setNotificationReadStatus(
      req.params.notificationId,
      req.user.id,
      false
    );

    await recordAudit({
      action: 'mark_unread',
      entityType: 'notification',
      entityId: notification.id,
      userId: req.user.id,
      teamId: notification.teamId || '',
      chartId: notification.chartId || '',
      taskId: notification.taskId || '',
      details: {
        projectId: notification.projectId || '',
      },
    });

    return successResponse(
      res,
      'Notification marked as unread',
      notification
    );
  } catch (error) {
    if (error.message === 'NOTIFICATION_NOT_FOUND') {
      return errorResponse(res, 'Notification not found', 'NOTIFICATION_NOT_FOUND', [], 404);
    }
    if (error.message === 'NOTIFICATION_UNAUTHORIZED') {
      return errorResponse(res, 'Unauthorized', 'NOTIFICATION_UNAUTHORIZED', [], 403);
    }

    return errorResponse(res, 'Failed to mark notification as unread', 'UPDATE_NOTIFICATION_ERROR', [error.message], 500);
  }
};

export const createNotificationMass = async (data, recipientIds) => {
  return notificationsService.createNotificationsForRecipients(data, recipientIds);
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await notificationsService.deleteNotification(
      req.params.notificationId,
      req.user.id
    );

    await recordAudit({
      action: 'delete',
      entityType: 'notification',
      entityId: notification.notificationId,
      userId: req.user.id,
      teamId: notification.teamId || '',
      chartId: notification.chartId || '',
      taskId: notification.taskId || '',
      details: {
        projectId: notification.projectId || '',
        softDelete: true,
      },
    });

    return successResponse(
      res,
      'Notification deleted successfully',
      notification
    );
  } catch (error) {
    if (error.message === 'NOTIFICATION_NOT_FOUND') {
      return errorResponse(res, 'Notification not found', 'NOTIFICATION_NOT_FOUND', [], 404);
    }
    if (error.message === 'NOTIFICATION_UNAUTHORIZED') {
      return errorResponse(res, 'Unauthorized', 'NOTIFICATION_UNAUTHORIZED', [], 403);
    }

    return errorResponse(res, 'Failed to delete notification', 'DELETE_NOTIFICATION_ERROR', [error.message], 500);
  }
};
