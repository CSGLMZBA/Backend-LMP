import { db } from '../../config/firebase.js';
import * as teamsRepository from '../teams/teams.repository.js';

const chartsCollectionName = 'Charts' 

export const createChart = async (chartsData) => {
  const chartsRef = db.collection(chartsCollectionName);
  const docRef = await chartsRef.add(chartData);
  return { id: docRef.id, ...chartData };
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

export const getChartsByUserId = async (userId) => {
  const userTeams = await teamsRepository.getTeamsByUserId(userId);

  const snapshots = await Promise.all(
    userTeams.map((team) =>
      db
        .collection(chartsCollectionName)
        .where('teamId', '==', team.id)
        .get()
    )
  );
  
  const charts = snapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  );

  return charts;
};

