import * as chartsRepository from './charts.repository.js';
import * as teamsService from '../teams/teams.service.js';

export const createChart = async (data, userId) => {
  await teamsService.assertTeamMembership(data.teamId, userId);

  const chartData = {
    name: data.name,
    teamId: data.teamId,
    stageIds: data.stages,
    creatorId: userId,
    createdAt: new Date(),
  };

  // Save to database
  const newChart = await chartsRepository.createChart(chartData);

  return newChart;
};

export const getChartsByUser = async (userId) => {
  const teams = await teamsService.getTeamsByUser(userId);
  const snapshots = await Promise.all(
    teams.map((team) => chartsRepository.getChartsByTeamId(team.id))
  );
  const charts = snapshots.flat();
  
  return charts.map(chart => ({
    id: chart.id,
    name: chart.name,
    teamId: chart.teamId,
    stageIds: chart.stages,
    creatorId: chart.creatorId,
    createdAt: chart.createdAt,
  }));
};

export const getChartById = async (chartId, userId) => {
  const chart = await chartsRepository.getChartById(chartId);
  if (!chart) {
    throw new Error('CHART_NOT_FOUND');
  }

  try {
    await teamsService.assertTeamMembership(chart.teamId, userId);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      throw new Error('UNAUTHORIZED');
    }

    throw error;
  }
  
  return {
    id: chart.id,
    name: chart.name,
    teamId: chart.teamId,
    stageIds: chart.stages,
    creatorId: chart.creatorId,
    createdAt: chart.createdAt
  };
};
