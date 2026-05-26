import bcrypt from 'bcryptjs';
import * as teamsRepository from './teams.repository.js';
import { env } from '../../config/env.js';

const removeSensitiveFields = (team) => {
  if (!team) return team;

  const { password, ...safeTeam } = team;
  return safeTeam;
};

export const getTeamMembership = async (teamId, userId) => {
  const team = await teamsRepository.getTeamById(teamId);

  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }

  return teamsRepository.findTeamMember(teamId, userId);
};

export const assertTeamMembership = async (teamId, userId) => {
  const membership = await getTeamMembership(teamId, userId);

  if (!membership) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }

  return membership;
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

  await teamsRepository.createTeamMember({
    teamId: newTeam.id,
    userId,
    role: 'OWNER',
    joinedAt: now,
  });

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
