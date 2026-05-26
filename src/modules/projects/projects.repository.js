import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const projectsCollectionName = 'projects'; // Easier to update later and to avoid typos

export const createProject = async (data) => {
  const docRef = await db
    .collection(projectsCollectionName)
    .add(data);

  return {
    id: docRef.id,
    ...data,
  };
};

export const getProjects = async () => {
  const snapshot = await db
    .collection(projectsCollectionName)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getProjectsByTeamId = async (teamId) => {
  const snapshot = await db
    .collection(projectsCollectionName)
    .where('teamId', '==', teamId)
    .where('status', '!=', 'DELETED')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getProjectById = async (id) => {
  const doc = await db
    .collection(projectsCollectionName)
    .doc(id)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
};

export const updateProject = async (id, data) => {
  const docRef = db.collection(projectsCollectionName).doc(id);

  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();

  return {
    id: updated.id,
    ...updated.data(),
  };
};
