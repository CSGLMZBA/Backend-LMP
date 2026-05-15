import { db } from '../../config/firebase.js';

export const createTeam = async (teamData) => {
  const teamsRef = db.collection('teams');
  const docRef = await teamsRef.add(teamData);
  return { id: docRef.id, ...teamData };
};

export const getTeamById = async (teamId) => {
  const teamDoc = await db.collection('teams').doc(teamId).get();
  if (!teamDoc.exists) {
    return null;
  }
  return { id: teamDoc.id, ...teamDoc.data() };
};

export const getTeamsByUserId = async (userId) => {
  const teamsSnapshot = await db
    .collection('teams')
    .where('members', 'array-contains', userId)
    .get();
  
  return teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateTeam = async (teamId, updateData) => {
  await db.collection('teams').doc(teamId).update(updateData);
  return await getTeamById(teamId);
};
