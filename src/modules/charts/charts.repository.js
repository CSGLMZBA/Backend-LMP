import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const chartsCollectionName = 'charts';

const isActiveChart = (chart) => chart.isArchived !== true;

export const createChart = async (chartsData) => {
  const chartsRef = db.collection(chartsCollectionName);
  const docRef = await chartsRef.add({
    ...chartsData,
    isArchived: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const created = await docRef.get();

  return { id: created.id, ...created.data() };
};

export const getChartById = async (chartId) => {
  const chartDoc = await db.collection(chartsCollectionName).doc(chartId).get();
  if (!chartDoc.exists) {
    return null;
  }
  return { id: chartDoc.id, ...chartDoc.data() };
};

export const getChartsByTeamId = async (teamId) => {
  const chartsSnapshot = await db
    .collection(chartsCollectionName)
    .where('teamId', '==', teamId) // Check that we are a member
    .get();

  return chartsSnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(isActiveChart);
};

export const getChartsByProjectId = async (projectId) => {
  const chartsSnapshot = await db
    .collection(chartsCollectionName)
    .where('projectId', '==', projectId)
    .get();

  return chartsSnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(isActiveChart);
};

export const updateChart = async (chartId, data) => {
  const docRef = db.collection(chartsCollectionName).doc(chartId);

  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();

  return { id: updated.id, ...updated.data() };
};

export const archiveChart = async (chartId, userId) => {
  return updateChart(chartId, {
    isArchived: true,
    archivedAt: FieldValue.serverTimestamp(),
    archivedBy: userId,
  });
};

export const addStageToChart = async (chartId, stageId) => {
  const docRef = db.collection(chartsCollectionName).doc(chartId);

  await docRef.update({
    stageIds: FieldValue.arrayUnion(stageId),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();

  return { id: updated.id, ...updated.data() };
};

export const removeStageFromChart = async (chartId, stageId) => {
  const docRef = db.collection(chartsCollectionName).doc(chartId);

  await docRef.update({
    stageIds: FieldValue.arrayRemove(stageId),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();

  return { id: updated.id, ...updated.data() };
};
