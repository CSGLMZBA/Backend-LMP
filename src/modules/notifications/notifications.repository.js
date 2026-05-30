  import { db } from '../../config/firebase.js';
  import admin from 'firebase-admin';

  const { FieldValue } = admin.firestore;

  const notificationsCollectionName = 'notifications';
  const DEFAULT_NOTIFICATION_FIELDS = {
    title: '',
    body: '',
    recipientId: '',
    type: '',
    read: false,
    actorId: '',
    teamId: '',
    projectId: '',
    chartId: '',
    taskId: '',
    isDeleted: false,
  };

  const serializeDoc = (doc) => ({
    id: doc.id,
    ...doc.data(),
  });

  export const notificationsRepository = {
    async create(data) {
      const docRef = await db.collection(notificationsCollectionName).add({
        ...DEFAULT_NOTIFICATION_FIELDS,
        ...data,
        read: false,
        isDeleted: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const created = await docRef.get();
      return serializeDoc(created);
    },
    async readByRecipient(recipientId) {
      const snapshot = await db
        .collection(notificationsCollectionName)
        .where('recipientId', '==', recipientId)
        .where('read', '==', false)
        .get();

      if (snapshot.empty) {
        return [];
      }
      const activeDocs = snapshot.docs
        .filter((doc) => doc.data().isDeleted !== true);

      await Promise.all(
        activeDocs.map((doc) => {
          const docRef = db.collection(notificationsCollectionName).doc(doc.id);
          return docRef.update({
            read: true,
            readAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        })
      );

      const updated = await db
        .collection(notificationsCollectionName)
        .where('recipientId', '==', recipientId)
        .get();


      return updated.docs
        .map(serializeDoc)
        .filter((notification) => notification.isDeleted !== true)
        .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
    },
    async getByRecipient(recipientId) {
      const snapshot = await db
        .collection(notificationsCollectionName)
        .where('recipientId', '==', recipientId)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs
        .map(serializeDoc)
        .filter((notification) => notification.isDeleted !== true)
        .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
    },

    async updateReadStatus(id, read) {
      const docRef = db.collection(notificationsCollectionName).doc(id);

      await docRef.update({
        read,
        readAt: read ? FieldValue.serverTimestamp() : null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const updated = await docRef.get();
      return serializeDoc(updated);
    },

    async delete(id) {
      const docRef = db.collection(notificationsCollectionName).doc(id);
      const existing = await docRef.get();

      if (!existing.exists) {
        return null;
      }

      await docRef.update({
        isDeleted: true,
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const deleted = await docRef.get();
      return serializeDoc(deleted);
    },

    async findById(id) {
      const doc = await db.collection(notificationsCollectionName).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return serializeDoc(doc);
    },
  };
