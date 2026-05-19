import bcrypt from 'bcrypt'
import { userRepository } from './auth.repository.js';

import { generateAccessToken } from '../../utils/jwt.js';

import { env } from '../../config/env.js';

const removeSensitiveFields = (user) => {
  if (!user) return user

  const clean = { ...user }
  delete clean.passwordHash

  return clean

} 

export const register = async (data) => {
  let existingUser = await userRepository.findByEmail(data.email);

  if (existingUser && existingUser.activo) {
    throw new Error('EMAIL_ALREADY_IN_USE');
  }

  existingUser = await userRepository.findByUserName(data.userName);

  if (existingUser && existingUser.activo) {
    throw new Error('USERNAME_ALREADY_IN_USE');
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    Number(env.BCRYPT_SALT_ROUNDS)
  );

  const user = await userRepository.create({
    displayName: data.displayName,
    userName: data.userName,
    email: data.email,
    passwordHash: hashedPassword,
    rol: 'cliente',
    activo: true,
    createdAt: new Date(),
  });

  return removeSensitiveFields(user);
};



export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  
  return removeSensitiveFields(user);
};

export const login = async (data) => {
  const user = await userRepository.findByEmail(data.email);

  if (!user || !user.activo) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const validPassword = await bcrypt.compare(
  data.password,
  user.passwordHash
  );

  if (!validPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    rol: user.rol,
  });

  delete user.password;

  return {
    user,
    token,
  };
};

export const update = async(id, payload) => {
    const user = await userRepository.findById(id);

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }
    
    const data = { ...payload }

    if (payload.userName && payload.userName !== user.userName) {
      const exists = await userRepository.findByUserName(payload.userName)

      if (exists && exists.activo) {
        throw createError('UserName already exists', 409, 'USERNAME_ALREADY_EXISTS')
      }
    }
    if (payload.email && payload.email !== user.email) {
      const exists = await userRepository.findByEmail(payload.email)

      if (exists && exists.activo) {
        throw createError('Email already in use', 409, 'EMAIL_ALREADY_IN_USE')
      }
    }

    if (payload.password) {
      data.passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS)
      delete data.password
    }

    const updated = await userRepository.update(id, data)

    return removeSensitiveFields(updated)
};

export const softDelete = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.activo === false) {
    throw createError('User already deleted', 400, 'USER_ALREADY_DELETED');
  }

  const updated = await userRepository.softDelete(userId);

  return removeSensitiveFields(updated);
};
