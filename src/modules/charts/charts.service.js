import * as chartsRepository from './charts.repository.js';
import * as teamsService from '../teams/teams.service.js';
import * as stagesService from '../stages/stages.service.js';
import * as projectsRepository from '../projects/projects.repository.js';

const mapChart = (chart) => ({
  id: chart.id,
  name: chart.name,
  teamId: chart.teamId,
  projectId: chart.projectId,
  stageIds: chart.stageIds,
  creatorId: chart.creatorId,
  createdAt: chart.createdAt,
  updatedAt: chart.updatedAt,
});

const assertActiveChart = (chart) => {
  if (!chart || chart.isArchived) {
    throw new Error('CHART_NOT_FOUND');
  }

  return chart;
};

const assertProjectBelongsToTeam = async (projectId, teamId) => {
  const project = await projectsRepository.getProjectById(projectId);

  if (!project || project.status === 'DELETED') {
    throw new Error('PROJECT_NOT_FOUND');
  }

  if (project.teamId !== teamId) {
    throw new Error('PROJECT_TEAM_MISMATCH');
  }

  return project;
};

export const createChart = async (data, userId) => {
  await assertProjectBelongsToTeam(data.projectId, data.teamId);
  await teamsService.assertTeamRole(data.teamId, userId, ['OWNER', 'MANAGER']);

  const chartData = {
    name: data.name,
    teamId: data.teamId,
    projectId: data.projectId,
    stageIds: data.stageIds || [],
    creatorId: userId,
  };

  const newChart = await chartsRepository.createChart(chartData);

  if (newChart.stageIds.length > 0) {
    return { ...newChart, stages: [] };
  }

  const stages = await stagesService.createDefaultStages(
    newChart.id,
    newChart.teamId,
    userId
  );
  const stageIds = stages.map((stage) => stage.id);
  const updatedChart = await chartsRepository.updateChart(newChart.id, {
    stageIds,
  });

  return {
    ...updatedChart,
    stages,
  };
};

export const getChartsByUser = async (userId) => {
  const teams = await teamsService.getTeamsByUser(userId);
  const snapshots = await Promise.all(
    teams.map((team) => chartsRepository.getChartsByTeamId(team.id))
  );
  const charts = snapshots.flat();
  
  return charts.map(mapChart);
};

export const getChartById = async (chartId, userId) => {
  const chart = assertActiveChart(
    await chartsRepository.getChartById(chartId)
  );

  try {
    await teamsService.assertTeamMembership(chart.teamId, userId);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      throw new Error('UNAUTHORIZED');
    }

    throw error;
  }
  
  return mapChart(chart);
};

export const updateChart = async (chartId, data, userId) => {
  const chart = assertActiveChart(
    await chartsRepository.getChartById(chartId)
  );

  await teamsService.assertTeamRole(chart.teamId, userId, [
    'OWNER',
    'MANAGER',
  ]);

  return chartsRepository.updateChart(chartId, data);
};

export const archiveChart = async (chartId, userId) => {
  const chart = assertActiveChart(
    await chartsRepository.getChartById(chartId)
  );

  await teamsService.assertTeamRole(chart.teamId, userId, [
    'OWNER',
    'MANAGER',
  ]);

  await stagesService.archiveStagesByChart(chart.id, chart.teamId, userId);
  const archivedChart = await chartsRepository.archiveChart(chartId, userId);

  return {
    ...mapChart(archivedChart),
    isArchived: archivedChart.isArchived,
    archivedAt: archivedChart.archivedAt,
    archivedBy: archivedChart.archivedBy,
  };
};
