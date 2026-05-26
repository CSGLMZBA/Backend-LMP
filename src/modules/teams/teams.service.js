import bcrypt from 'bcryptjs';
import * as teamsRepository from './teams.repository.js';
import { env } from '../../config/env.js';

const removeSensitiveFields = (team) => {
  if (!team) return team;

  const { password, ...safeTeam } = team;
  return safeTeam;
};

export const createTeam = async (data, userId) => {
  const now = new Date();
  const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const teamData = {
    name: data.name,
    description: data.description || '',
    password: hashedPassword,
    ownerId: userId,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    members: [userId], // Add creator as first member
  };

  const newTeam = await teamsRepository.createTeam(teamData);

  return removeSensitiveFields(newTeam);
};

export const getTeamsByUser = async (userId) => {
  const teams = await teamsRepository.getTeamsByUserId(userId);
  
  return teams.map(removeSensitiveFields);
};

export const getTeamById = async (teamId, userId) => {
  const team = await teamsRepository.getTeamById(teamId);
  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }
  
  const members = team.members || [];

  if (!members.includes(userId)) {
    throw new Error('UNAUTHORIZED');
  }
  
  return removeSensitiveFields(team);
};
