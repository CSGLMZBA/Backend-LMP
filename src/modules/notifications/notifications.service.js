import { notificationsRepository } from './notifications.repository.js';

export const createNotification = async (data) => {
  const notification = await notificationsRepository.create({
    title: data.title,
    body: data.body,
    type: data.type,
    recipientId: data.recipientId,
    read: false,
  });

  return notification;
};

export const getNotificationsForRecipient = async (recipientId) => {
  const readNotifications = await notificationsRepository.readByRecipient(recipientId);
  const notifications = await notificationsRepository.getByRecipient(recipientId);


  return notifications;
};
export const readNotificationsForRecipient = async (recipientId) => {
  const notifications = await notificationsRepository.getByRecipient(recipientId);


  return notifications;
};

export const getNotificationById = async (notificationId,recipientId) => {
  const notification = await notificationsRepository.findById(notificationId);
  if (!notification) {
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

  if (!notification) {
    throw new Error('NOTIFICATION_NOT_FOUND');
  }

  if (notification.recipientId !== recipientId) {
    throw new Error('NOTIFICATION_UNAUTHORIZED');
  }

  return notificationsRepository.delete(notificationId);
};
