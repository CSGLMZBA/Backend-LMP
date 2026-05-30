import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../../../config/firebase.js';

const commentsCollectionName = 'comments';
//forgot serializeDoc
const serializeDoc = (doc) => {
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...doc.data(),
  };
};
// COMMENT
export const postComment = async (commentData) => {
  const tasksRef = db.collection(commentsCollectionName);
  const docRef = await tasksRef.add({
    ...commentData,
    createdAt: FieldValue.serverTimestamp(),
  }
  );
  return { id: docRef.id, ...commentData };
};

export const getCommentById = async (id) =>   
{
  const doc = await db.collection(commentsCollectionName).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return serializeDoc(doc);
};

export const getCommentsByTaskId = async (taskId) =>
{

  const snapshot = await db
    .collection(commentsCollectionName)
    .where('taskId', '==', taskId)
    .get();
  
  if (snapshot.empty) 
  {
    return [];
  }

  return snapshot.docs
  .map(serializeDoc)
  .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
};

export const deleteComment = async (id) => {
  const docRef = db.collection(commentsCollectionName).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    return null;
  }

  await docRef.delete();
  return serializeDoc(existing);
};