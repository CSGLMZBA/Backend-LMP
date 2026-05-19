import bcrypt from 'bcryptjs';
import * as chartsRepository from './charts.repository.js';
import * as teamsRepository from '../teams/teams.repository.js';
import { env } from '../../config/env.js';

export const createChart = async (data, userId) => {
  // Encrypt the password so we don't store plain passwords in the databased as specified in the document in the Teams channel

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
  const charts = await chartsRepository.getChartsByUserId(userId);
  
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
  const team = await teamsRepository.getTeamById(chart.teamId);
  if (!team) {
    throw new Error('CHART_HAS_NO_TEAM');
  }
  // Verify user is a member of the team so they can view it
  if (!team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED');
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