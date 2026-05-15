import { db } from '../../config/firebase.js';

const teamsCollectionName = 'teams' 

export const createTeam = async (teamData) => {
  const teamsRef = db.collection(teamsCollectionName);
  const docRef = await teamsRef.add(teamData);
  return { id: docRef.id, ...teamData };
};

export const getTeamById = async (teamId) => {
  const teamDoc = await db.collection(teamsCollectionName).doc(teamId).get();
  if (!teamDoc.exists) {
    return null;
  }
  return { id: teamDoc.id, ...teamDoc.data() };
};

export const getTeamsByUserId = async (userId) => {
  const teamsSnapshot = await db
    .collection(teamsCollectionName)
    .where('members', 'array-contains', userId) // Check that we are a member
    .get();
  
  return teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
