import { db } from '../../config/firebase.js';

export const findUserByEmail = async (email) => {
  const snapshot = await db
    .collection('usuarios')
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
  const docRef = await db.collection('usuarios').add(userData);

  return {
    id: docRef.id,
    ...userData,
  };
};