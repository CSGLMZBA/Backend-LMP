import bcrypt from 'bcrypt'
import { userRepository } from './auth.repository.js';

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

import { env } from '../../config/env.js';

const removeSensitiveFields = (data) => {
  if (!data) return data;

  const sanitize = ({ passwordHash, tokenVersion, ...user }) => user;

  return Array.isArray(data)
    ? data.map(sanitize)
    : sanitize(data);
};

export const register = async (data) => {
  let existingUser = await userRepository.findByEmailActive(data.email);

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_IN_USE');
  }

  existingUser = await userRepository.findByUserNameActive(data.userName);

  if (existingUser) {
    throw new Error('USERNAME_ALREADY_IN_USE');
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    env.BCRYPT_SALT_ROUNDS
  );

  const user = await userRepository.create({
    displayName: data.displayName,
    userName: data.userName,
    email: data.email,
    passwordHash: hashedPassword,
    role: 'client',
    status: "offline",
    active: true,
    createdAt: new Date(),
    tokenVersion: 0
  });

  return removeSensitiveFields(user);
};


export const login = async (data) => {

  const user = await userRepository.findByEmailActive(data.email);
  
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Compare the plain password with the stored hash
  const validPassword = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const payload = {
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const updatedUser = await userRepository.login(user.id);

  return {
    user: removeSensitiveFields(updatedUser),
    accessToken,
    refreshToken,
  };
};

export const logout = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.active) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const result = await userRepository.logout(userId);
};


export const refresh = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await userRepository.findById(decoded.id);

    if (!user || !user.active) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const payload = {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken(payload);

    // optional rotation
    const newRefreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
};

export const updatePassword = async (id, data) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  const validPassword = await bcrypt.compare(
    data.oldPassword,
    user.passwordHash
  );

  if (!validPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const newPasswordHash = await bcrypt.hash(
    data.password,
    env.BCRYPT_SALT_ROUNDS
  );

  const updateData = {
    passwordHash: newPasswordHash,
  };


  const updated = await userRepository.update(id, updateData);

  return removeSensitiveFields(updated);
};