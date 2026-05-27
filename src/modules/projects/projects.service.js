import * as repository from './projects.repository.js';
import * as teamsService from '../teams/teams.service.js';
import * as chartsRepository from '../charts/charts.repository.js';
import * as tasksRepository from '../Task/task.repository.js';

const buildTaskSummary = (tasks) => tasks.reduce((summary, task) => {
  const status = task.status || 'UNKNOWN';
  const priority = String(task.priority || 'UNKNOWN');

  summary.total += 1;
  summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
  summary.byPriority[priority] = (summary.byPriority[priority] || 0) + 1;

  if (task.status === 'COMPLETED') {
    summary.completed += 1;
  }

  if (task.isBlocked) {
    summary.blocked += 1;
  }

  return summary;
}, {
  total: 0,
  completed: 0,
  blocked: 0,
  byStatus: {},
  byPriority: {},
});

export const createProject = async (data, userId) => {
  await teamsService.assertTeamRole(data.teamId, userId, ['OWNER', 'MANAGER']);

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

  if (!project || project.status === 'DELETED') {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await teamsService.assertTeamMembership(project.teamId, userId);

  const [charts, tasks] = await Promise.all([
    chartsRepository.getChartsByProjectId(project.id),
    tasksRepository.getTasksByProjectId(project.id),
  ]);

  return {
    ...project,
    charts,
    taskSummary: buildTaskSummary(tasks),
  };
};

export const updateProject = async (id, data, userId) => {
  const project = await repository.getProjectById(id);

  if (!project || project.status === 'DELETED') {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await teamsService.assertTeamRole(project.teamId, userId, [
    'OWNER',
    'MANAGER',
  ]);

  return repository.updateProject(id, data);
};

export const updateProjectStatus = async (id, status, userId) => {
  const project = await repository.getProjectById(id);

  if (!project || project.status === 'DELETED') {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await teamsService.assertTeamRole(project.teamId, userId, [
    'OWNER',
    'MANAGER',
  ]);

  return repository.updateProject(id, { status });
};

export const deleteProject = async (id, userId) => {
  const project = await repository.getProjectById(id);

  if (!project || project.status === 'DELETED') {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await teamsService.assertTeamRole(project.teamId, userId, ['OWNER']);

  return repository.updateProject(id, {
    status: 'DELETED',
    deletedAt: new Date(),
    deletedBy: userId,
  });
};
