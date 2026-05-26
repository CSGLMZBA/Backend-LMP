import * as repository from './projects.repository.js';
import * as teamsService from '../teams/teams.service.js';

export const createProject = async (data, userId) => {
  await teamsService.assertTeamMembership(data.teamId, userId);

  return repository.createProject({
    name: data.name,
    description: data.description || '',
    teamId: data.teamId,
    ownerId: userId,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getProjects = async (userId) => {
  const teams = await teamsService.getTeamsByUser(userId);
  const projectLists = await Promise.all(
    teams.map((team) => repository.getProjectsByTeamId(team.id))
  );

  return projectLists.flat();
};

export const getProjectById = async (id, userId) => {
  const project = await repository.getProjectById(id);

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await teamsService.assertTeamMembership(project.teamId, userId);

  return project;
};
