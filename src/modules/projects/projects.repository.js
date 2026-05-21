import { db } from '../../config/firebase.js';

const projectsCollectionName = 'projects' // Easier to update later and to avoid typos

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