import bcrypt from 'bcryptjs';
import * as teamsRepository from './teams.repository.js';
import { env } from '../../config/env.js';

export const createTeam = async (data, userId) => {
  // Encrypt the password so we don't store plain passwords in the databased as specified in the document in the Teams channel
  const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  // Create team object with user Id (creatorId and hashed password
  const teamData = {
    name: data.name,
    password: hashedPassword,
    creatorId: userId,
    createdAt: new Date(),
    members: [userId], // Add creator as first member
  };

  // Save to database
  const newTeam = await teamsRepository.createTeam(teamData);

  // Return without exposing the hashed password
  return {
    id: newTeam.id,
    name: newTeam.name,
    creatorId: newTeam.creatorId,
    members: newTeam.members,
    createdAt: newTeam.createdAt,
  };
};

export const getTeamsByUser = async (userId) => {
  const teams = await teamsRepository.getTeamsByUserId(userId);
  
  // Return without exposing passwords
  return teams.map(team => ({
    id: team.id,
    name: team.name,
    creatorId: team.creatorId,
    members: team.members,
    createdAt: team.createdAt,
  }));
};

export const getTeamById = async (teamId, userId) => {
  const team = await teamsRepository.getTeamById(teamId);
  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }
  
  // Verify user is a member of the team so they can view it
  if (!team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED');
  }
  
  // Return without exposing password
  return {
    id: team.id,
    name: team.name,
    creatorId: team.creatorId,
    members: team.members,
    createdAt: team.createdAt,
  };
};