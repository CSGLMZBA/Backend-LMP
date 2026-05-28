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

  if (!team || team.status === 'ARCHIVED') {
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

export const assertTeamRole = async (teamId, userId, allowedRoles) => {
  const membership = await assertTeamMembership(teamId, userId);

  if (!allowedRoles.includes(membership.role)) {
    throw new Error('INSUFFICIENT_TEAM_ROLE');
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
  const memberships = await teamsRepository.getTeamMembersByUserId(userId);
  const teamsByMembership = await Promise.all(
    memberships.map((membership) =>
      teamsRepository.getTeamById(membership.teamId)
    )
  );
  const teamsById = new Map();
  
  teamsByMembership
    .filter((team) => team && team.status !== 'ARCHIVED')
    .forEach((team) => {
      teamsById.set(team.id, team);
    });

  return [...teamsById.values()].map(removeSensitiveFields);
};

export const getTeamById = async (teamId, userId) => {
  const team = await teamsRepository.getTeamById(teamId);
  if (!team || team.status === 'ARCHIVED') {
    throw new Error('TEAM_NOT_FOUND');
  }
  
  const membership = await getTeamMembership(teamId, userId);

  if (!membership) {
    throw new Error('UNAUTHORIZED');
  }
  
  return removeSensitiveFields(team);
};

export const updateTeam = async (teamId, data, userId) => {
  const team = await teamsRepository.getTeamById(teamId);

  if (!team || team.status === 'ARCHIVED') {
    throw new Error('TEAM_NOT_FOUND');
  }

  await assertTeamRole(teamId, userId, ['OWNER', 'MANAGER']);

  const updateData = {
    updatedAt: new Date(),
    updatedBy: userId,
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
  }

  const updatedTeam = await teamsRepository.updateTeam(teamId, updateData);

  return removeSensitiveFields(updatedTeam);
};

export const archiveTeam = async (teamId, userId) => {
  const team = await teamsRepository.getTeamById(teamId);

  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }

  if (team.status === 'ARCHIVED') {
    throw new Error('TEAM_ALREADY_ARCHIVED');
  }

  await assertTeamRole(teamId, userId, ['OWNER']);

  const archivedTeam = await teamsRepository.updateTeam(teamId, {
    status: 'ARCHIVED',
    archivedAt: new Date(),
    archivedBy: userId,
    updatedAt: new Date(),
    updatedBy: userId,
  });

  return removeSensitiveFields(archivedTeam);
};

export const joinTeam = async (teamId, userId, password) => {
  const team = await teamsRepository.getTeamById(teamId);

  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }

  if (team.status !== 'ACTIVE') {
    throw new Error('TEAM_NOT_ACTIVE');
  }

  const existingMember = await teamsRepository.findTeamMember(teamId, userId);

  if (existingMember) {
    throw new Error('USER_ALREADY_IN_TEAM');
  }

  const validPassword = await bcrypt.compare(password, team.password);

  if (!validPassword) {
    throw new Error('INVALID_TEAM_PASSWORD');
  }

  return teamsRepository.createTeamMember({
    teamId,
    userId,
    role: 'MEMBER',
    joinedAt: new Date(),
  });
};

export const getTeamMembers = async (teamId, userId) => {
  await assertTeamMembership(teamId, userId);

  return teamsRepository.getTeamMembersByTeamId(teamId);
};

export const addTeamMember = async (teamId, data, addedBy) => {
  await assertTeamRole(teamId, addedBy, ['OWNER', 'MANAGER']);

  const existingMember = await teamsRepository.findTeamMember(
    teamId,
    data.userId
  );

  if (existingMember) {
    throw new Error('USER_ALREADY_IN_TEAM');
  }

  return teamsRepository.createTeamMember({
    teamId,
    userId: data.userId,
    role: data.role,
    joinedAt: new Date(),
    addedBy,
  });
};

export const updateTeamMemberRole = async (teamId, userId, role, updatedBy) => {
  await assertTeamRole(teamId, updatedBy, ['OWNER']);

  const member = await teamsRepository.findTeamMember(teamId, userId);

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  if (member.role === 'OWNER' && role !== 'OWNER') {
    const ownerCount = await teamsRepository.countTeamOwners(teamId);

    if (ownerCount <= 1) {
      throw new Error('LAST_OWNER_ROLE_CANNOT_CHANGE');
    }
  }

  return teamsRepository.updateTeamMember(member.id, {
    role,
    updatedAt: new Date(),
    updatedBy,
  });
};

export const removeTeamMember = async (teamId, userId, removedBy) => {
  await assertTeamRole(teamId, removedBy, ['OWNER']);

  const member = await teamsRepository.findTeamMember(teamId, userId);

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  if (member.role === 'OWNER') {
    const ownerCount = await teamsRepository.countTeamOwners(teamId);

    if (ownerCount <= 1) {
      throw new Error('LAST_OWNER_CANNOT_BE_REMOVED');
    }
  }

  await teamsRepository.deleteTeamMember(member.id);

  return {
    removed: true,
    memberId: member.id,
    teamId,
    userId,
    role: member.role,
  };
};
