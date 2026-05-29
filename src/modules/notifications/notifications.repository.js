  import { db } from '../../config/firebase.js';
  import admin from 'firebase-admin';

  const { FieldValue } = admin.firestore;

  const notificationsCollectionName = 'notifications';
  const DEFAULT_NOTIFICATION_FIELDS = {
    title: '',
    body: '',
    recipientId: '',
    type: 0,
    read: false,
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
      snapshot.docs.forEach(async (doc)=>
      {
          const docRef = db.collection(notificationsCollectionName).doc(doc.id);
          await docRef.update({
            read: true,
            updatedAt: FieldValue.serverTimestamp(),
          });
      });
      const updated = await db
        .collection(notificationsCollectionName)
        .where('recipientId', '==', recipientId)
        .get();


      return updated.docs
        .map(serializeDoc)
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
        .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
    },

    async updateReadStatus(id, read) {
      const docRef = db.collection(notificationsCollectionName).doc(id);

      await docRef.update({
        read,
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

      await docRef.delete();
      return serializeDoc(existing);
    },

    async findById(id) {
      const doc = await db.collection(notificationsCollectionName).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return serializeDoc(doc);
    },
  };
