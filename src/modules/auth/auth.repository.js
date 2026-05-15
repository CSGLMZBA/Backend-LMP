import { db } from '../../config/firebase.js';

const usersCollectionName = 'usuarios' // Easier to update later and to avoid typos

export const findUserByEmail = async (email) => {
  const snapshot = await db
    .collection(usersCollectionName)
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  };
};

export const createUser = async (userData) => {
  const docRef = await db.collection(usersCollectionName).add(userData);

  return {
    id: docRef.id,
    ...userData,
  };
};