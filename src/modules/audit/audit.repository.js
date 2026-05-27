import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const auditCollectionName = 'audit' // Easier to update later and to avoid typos
const DEFAULT_AUDIT_FIELDS = {
  userId: "",
  teamId: "",
  chartId: "",
  stageId: "",
  taskId: "",

};

const serializeDoc = (doc) => ({
  id: doc.id,
  ...doc.data()
})

export const auditRepository = {
  async create(data) {
    const docRef = await db.collection(auditCollectionName).add({
      ...DEFAULT_AUDIT_FIELDS,
      ...data,
      performedAt: FieldValue.serverTimestamp(),
    });
  
    const created = await docRef.get();  
    return serializeDoc(created);
  },
  async get() {
    const snapshot = await db
        .collection(auditCollectionName).orderBy("performedAt","desc")
        .get();
    if (snapshot.empty) {
      return [];
    }
  
    return snapshot.docs.map(serializeDoc);
  },

async findById(id) {
  const doc = await db.collection(auditCollectionName).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return serializeDoc(doc);
},



};