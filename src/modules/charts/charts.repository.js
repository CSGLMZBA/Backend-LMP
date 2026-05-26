import { db } from '../../config/firebase.js';

const chartsCollectionName = 'Charts' 

export const createChart = async (chartsData) => {
  const chartsRef = db.collection(chartsCollectionName);
  const docRef = await chartsRef.add(chartsData);
  return { id: docRef.id, ...chartsData };
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

  return chartsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))};
