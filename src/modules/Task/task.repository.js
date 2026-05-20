import { db } from '../../config/firebase.js';

const tasksCollectionName = 'tasks';

export const createTask = async (taskData) => {
  const tasksRef = db.collection(tasksCollectionName);
  const docRef = await tasksRef.add(taskData);
  return { id: docRef.id, ...taskData };
};

export const getTaskById = async (taskId) => {
  const taskDoc = await db.collection(tasksCollectionName).doc(taskId).get();
  if (!taskDoc.exists) {
    return null;
  }
  return { id: taskDoc.id, ...taskDoc.data() };
};

export const getTasksByTeamId = async (teamId) => {
  const tasksSnapshot = await db
    .collection(tasksCollectionName)
    .where('teamId', '==', teamId)
    .where('isDeleted', '!=', true)
    .get();
  
  return tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getTasksByStageId = async (teamId, stageId) => {
  const tasksSnapshot = await db
    .collection(tasksCollectionName)
    .where('teamId', '==', teamId)
    .where('stageId', '==', stageId)
    .where('isDeleted', '!=', true)
    .get();
  
  return tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getTasksByUserId = async (userId) => {
  const tasksSnapshot = await db
    .collection(tasksCollectionName)
    .where('assignedUserIds', 'array-contains', userId)
    .where('isDeleted', '!=', true)
    .get();
  
  return tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getTasksByUserAndTeam = async (userId, teamId) => {
  const tasksSnapshot = await db
    .collection(tasksCollectionName)
    .where('teamId', '==', teamId)
    .where('assignedUserIds', 'array-contains', userId)
    .where('isDeleted', '!=', true)
    .get();
  
  return tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getTasksByPriority = async (teamId, priority) => {
  const tasksSnapshot = await db
    .collection(tasksCollectionName)
    .where('teamId', '==', teamId)
    .where('priority', '==', priority)
    .where('isDeleted', '!=', true)
    .get();
  
  return tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateTask = async (taskId, updateData) => {
  const taskRef = db.collection(tasksCollectionName).doc(taskId);
  await taskRef.update(updateData);
  
  const updatedDoc = await taskRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const softDeleteTask = async (taskId) => {
  const taskRef = db.collection(tasksCollectionName).doc(taskId);
  await taskRef.update({
    isDeleted: true,
    deletedAt: new Date()
  });
  return true;
};

// Verificaciones
export const verifyUserInTeam = async (teamId, userId) => {
  const teamDoc = await db.collection('teams').doc(teamId).get();
  if (!teamDoc.exists) return false;
  
  const teamData = teamDoc.data();
  const members = teamData.members || [];
  return members.includes(userId);
};

export const verifyUsersInTeam = async (teamId, userIds) => {
  const teamDoc = await db.collection('teams').doc(teamId).get();
  if (!teamDoc.exists) return false;
  
  const teamData = teamDoc.data();
  const members = teamData.members || [];
  return userIds.every(userId => members.includes(userId));
};

export const isUserAdminInTeam = async (teamId, userId) => {
  const teamDoc = await db.collection('teams').doc(teamId).get();
  if (!teamDoc.exists) return false;
  
  const teamData = teamDoc.data();
  return teamData.creatorId === userId;
};