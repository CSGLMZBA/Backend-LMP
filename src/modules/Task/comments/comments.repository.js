import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../../../config/firebase.js';

const commentsCollectionName = 'comments';

const serializeDoc = (doc) => {
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  };
};

const isActiveComment = (comment) => comment.isDeleted !== true;

export const createComment = async (commentData) => {
  const docRef = await db.collection(commentsCollectionName).add({
    ...commentData,
    isDeleted: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const created = await docRef.get();

  return serializeDoc(created);
};

export const getCommentById = async (id) => {
  const doc = await db.collection(commentsCollectionName).doc(id).get();

  return serializeDoc(doc);
};

export const getCommentsByTaskId = async (taskId) => {
  const snapshot = await db
    .collection(commentsCollectionName)
    .where('taskId', '==', taskId)
    .get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs
    .map(serializeDoc)
    .filter(isActiveComment)
    .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
};

export const updateComment = async (id, data) => {
  const docRef = db.collection(commentsCollectionName).doc(id);

  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();

  return serializeDoc(updated);
};

export const deleteComment = async (id, userId) => {
  return updateComment(id, {
    isDeleted: true,
    deletedAt: FieldValue.serverTimestamp(),
    deletedBy: userId,
  });
};
