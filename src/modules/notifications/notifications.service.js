import { notificationsRepository } from './notifications.repository.js';

export const createNotification = async (data) => {
  const notification = await notificationsRepository.create({
    title: data.title,
    body: data.body,
    type: data.type,
    recipientId: data.recipientId,
    actorId: data.actorId || '',
    teamId: data.teamId || '',
    projectId: data.projectId || '',
    chartId: data.chartId || '',
    taskId: data.taskId || '',
    read: false,
  });

  return notification;
};

export const createNotificationsForRecipients = async (data, recipientIds) => {
  const uniqueRecipientIds = [...new Set(recipientIds)].filter(Boolean);

  return Promise.all(
    uniqueRecipientIds.map((recipientId) =>
      createNotification({
        ...data,
        recipientId,
      })
    )
  );
};

export const getNotificationsForRecipient = async (recipientId) => {

  const notifications = await notificationsRepository.getByRecipient(recipientId);
  return notifications;
};
export const readNotificationsForRecipient = async (recipientId) => {
  const readNotifications = await notificationsRepository.readByRecipient(recipientId);

  return readNotifications;
};

export const getNotificationById = async (notificationId,recipientId) => {
  const notification = await notificationsRepository.findById(notificationId);
  if (!notification || notification.isDeleted) {
    throw new Error('NOTIFICATION_NOT_FOUND');
  }
  if (notification.recipientId !== recipientId)
  {
    throw new Error('NOTIFICATION_UNAUTHORIZED');
  }
  return notification;
};

export const setNotificationReadStatus = async (notificationId, recipientId, read) => {
  const notification = await getNotificationById(notificationId,recipientId);

  return notificationsRepository.updateReadStatus(notificationId, read);
};

export const deleteNotification = async (notificationId, recipientId) => {
  const notification = await notificationsRepository.findById(notificationId);

  if (!notification || notification.isDeleted) {
    throw new Error('NOTIFICATION_NOT_FOUND');
  }

  if (notification.recipientId !== recipientId) {
    throw new Error('NOTIFICATION_UNAUTHORIZED');
  }

  const deleted = await notificationsRepository.delete(notificationId);

  return {
    deleted: true,
    notificationId: deleted.id,
    recipientId: deleted.recipientId,
    taskId: deleted.taskId || '',
    teamId: deleted.teamId || '',
    projectId: deleted.projectId || '',
    chartId: deleted.chartId || '',
  };
};
