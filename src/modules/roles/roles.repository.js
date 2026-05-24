import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const rolesCollectionName = 'roles' // Easier to update later and to avoid typos
const DEFAULT_ROLES_FIELDS = {
  roleName: "undefined",
  roleLevel: 0,
  active: true,
  permissions: [],
};

const PERMISSIONS = {
  ADD_ROLES: "roles.create",
  MODIFY_DATABASE: "database.write",
  CREATE_TEAMS: "teams.create",
  EDIT_CHARTS: "charts.write",
  SEE_CHARTS: "charts:read"
};

const LEVEL_PERMISSIONS_MAP = {
  4: [PERMISSIONS.ADD_ROLES, PERMISSIONS.MODIFY_DATABASE, PERMISSIONS.CREATE_TEAMS, PERMISSIONS.EDIT_CHARTS, PERMISSIONS.SEE_CHARTS],
  3: [PERMISSIONS.MODIFY_DATABASE, PERMISSIONS.CREATE_TEAMS, PERMISSIONS.EDIT_CHARTS, PERMISSIONS.SEE_CHARTS],
  2: [PERMISSIONS.CREATE_TEAMS, PERMISSIONS.EDIT_CHARTS, PERMISSIONS.SEE_CHARTS],
  1: [PERMISSIONS.EDIT_CHARTS, PERMISSIONS.SEE_CHARTS],
  0: [PERMISSIONS.SEE_CHARTS]
};

const getPermissionsForLevel = (level) => {
  const lvl = level ?? 0;
  return LEVEL_PERMISSIONS_MAP[lvl] || LEVEL_PERMISSIONS_MAP[4];
};
const serializeDoc = (doc) => ({
  id: doc.id,
  ...doc.data()
})

export const rolesRepository = {
async findByNameActive (roleName) {
  const snapshot = await db
    .collection(rolesCollectionName)
    .where('roleName', '==', roleName)
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
  const doc = await db.collection(rolesCollectionName).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return serializeDoc(doc);
},
async get() {
  const snapshot = await db.collection(rolesCollectionName).get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(serializeDoc);
},
async create(data) {
  const levelPermissions = getPermissionsForLevel(data.roleLevel);
  
  const docRef = await db.collection(rolesCollectionName).add({
    ...DEFAULT_ROLES_FIELDS,
    permissions: levelPermissions,
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const created = await docRef.get();

  return serializeDoc(created);
},
async update(id, data) {
  const docRef = db.collection(rolesCollectionName).doc(id)

  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  })

  const updated = await docRef.get()

  return serializeDoc(updated)
},
async delete(id) {
  const docRef = await db.collection(rolesCollectionName).doc(id).delete();
  deleted = await docRef.get();
  return serializeDoc(deleted);
},
async softDelete(id) {
  const docRef = db.collection(rolesCollectionName).doc(id)
  await docRef.update({
    active: false,
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: FieldValue.serverTimestamp()
  })
  const updated = await docRef.get()
  return serializeDoc(updated)
}
};