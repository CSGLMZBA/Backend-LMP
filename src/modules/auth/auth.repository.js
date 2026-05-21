import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const usersCollectionName = 'users' // Easier to update later and to avoid typos
const DEFAULT_USER_FIELDS = {
  displayName: "",
  userName: "",
  email: "",
  rol: "cliente",
  status: "online",
  active: true,
  tokenVersion: 0,
  passwordHash: null,
};

const serializeDoc = (doc) => ({
  id: doc.id,
  ...doc.data()
})

export const userRepository = {
async findByEmail(email) {
  const snapshot = await db
    .collection(usersCollectionName)
    .where('email', '==', email)
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
    ...DEFAULT_USER_FIELDS,
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
},
};