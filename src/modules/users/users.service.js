import bcrypt from 'bcrypt'

import { usersRepository } from './users.repository.js';

import { generateAccessToken } from '../../utils/jwt.js';

import { env } from '../../config/env.js';

const removeSensitiveFields = (data) => {
  if (!data) return data;

  const sanitize = ({ passwordHash, ...user }) => user;

  return Array.isArray(data)
    ? data.map(sanitize)
    : sanitize(data);
};

export const postUser = async (data) => {
  let existingUser = await usersRepository.findByEmail(data.email);

  if (existingUser && existingUser.activo) {
    throw new Error('EMAIL_ALREADY_IN_USE');
  }

  existingUser = await usersRepository.findByUserName(data.userName);

  if (existingUser && existingUser.activo) {
    throw new Error('USERNAME_ALREADY_IN_USE');
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    env.BCRYPT_SALT_ROUNDS
  );

  const user = await usersRepository.create({
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

export const putUser = async (userId, data) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    env.BCRYPT_SALT_ROUNDS
  );

  const userNew = await usersRepository.update(userId,{
    displayName: data.displayName,
    userName: data.userName,
    email: data.email,
    passwordHash: hashedPassword,
    rol: 'cliente',
    activo: true,
    createdAt: new Date(),
  });

  return removeSensitiveFields(userNew);
};



export const getUserById = async (userId) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  
  return removeSensitiveFields(user);
};

export const getUsers = async () => {
  const users = await usersRepository.getUsers();
  if (users.length === 0) {
    throw new Error('USER_DATABASE_EMPTY');
  }
  
  return removeSensitiveFields(users);
};

export const login = async (data) => {
  const user = await usersRepository.findByEmail(data.email);

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

  user = removeSensitiveFields(user);

  return {
    removeSensitiveFields,
    token,
  };
};

export const update = async(id, payload) => {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }
    
    const data = { ...payload }

    if (payload.userName && payload.userName !== user.userName) {
      const exists = await usersRepository.findByUserName(payload.userName)

      if (exists && exists.activo) {
        throw createError('UserName already exists', 409, 'USERNAME_ALREADY_EXISTS')
      }
    }
    if (payload.email && payload.email !== user.email) {
      const exists = await usersRepository.findByEmail(payload.email)

      if (exists && exists.activo) {
        throw createError('Email already in use', 409, 'EMAIL_ALREADY_IN_USE')
      }
    }

    if (payload.password) {
      data.passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS)
      delete data.password
    }

    const updated = await usersRepository.update(id, data)

    return removeSensitiveFields(updated)
};

export const softDelete = async (userId) => {
  const user = await usersRepository.findById(userId);

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.activo === false) {
    throw createError('User already deleted', 400, 'USER_ALREADY_DELETED');
  }

  const updated = await usersRepository.softDelete(userId);

  return removeSensitiveFields(updated);
};
