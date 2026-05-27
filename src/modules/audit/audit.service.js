import bcrypt from 'bcrypt'
import { auditRepository } from './audit.repository.js';

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

import { env } from '../../config/env.js';


export const register = async (data) => {

  const audit = await auditRepository.create({
    userId: data.userId,
    teamId: data.teamId,
    chartId: data.chartId,
    stageId: data.stageId,
    taskId: data.taskId,
    details: data.details,
    performedAt: new Date(),
  });

  return audit;
};


export const get = async () => {

  const audit = await auditRepository.get();
  if(audit == [])
  {
    throw new Error("DATABASE_EMPTY");
  }
  return audit;
};
