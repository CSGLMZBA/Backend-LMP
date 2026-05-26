import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const usersCollectionName = 'usuarios' // Easier to update later and to avoid typos

const serializeDoc = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    displayName: data.displayName,
    userName: data.userName,
    email: data.email,
    rol: data.rol,
    active: data.activo ?? true,
    tokenVersion: data.tokenVersion ?? 0,
    passwordHash: data.passwordHash, 
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const userRepository = {
  async findByEmail(email) {
    
    const snapshot = await db.collection(usersCollectionName).where('email', '==', email).where('active', '==', true).limit(1).get();
    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  },

  async findByUserName (userName) {
    const snapshot = await db
      .collection(usersCollectionName)
      .where('userName', '==', userName)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  },

  async findById(id) {
    const doc = await db.collection(usersCollectionName).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return serializeDoc(doc);
  },

  async create(data) {
    const docRef = await db.collection(usersCollectionName).add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const created = await docRef.get();

    return serializeDoc(created);
  },
  async update(id, data) {
    const docRef = db.collection(usersCollectionName).doc(id)

    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    })

    const updated = await docRef.get()

    return serializeDoc(updated)
  },
  async incrementTokenVersion(userId) {
    const docRef = db.collection(usersCollectionName).doc(userId);

    await docRef.update({
      tokenVersion: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();

    return serializeDoc(updated);
  }
}