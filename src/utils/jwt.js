import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

//ACCESS TOKEN

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_REGISTER_SECRET, {
    expiresIn: env.JWT_REGISTER_EXPIRES_IN, // Fixed so it actually uses the specified time in the env file
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_REGISTER_SECRET);
};

//REFRESH TOKEN 

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyRefreshToken = (payload) => {
  return jwt.verify(token,env.JWT_REFRESH_SECRET);
};