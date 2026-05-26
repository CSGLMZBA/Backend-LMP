import bcrypt from 'bcryptjs'

import { usersRepository } from './users.repository.js';


import { env } from '../../config/env.js';

const removeSensitiveFields = (data) => {
  if (!data) return data;

  const sanitize = ({ passwordHash, tokenVersion, ...user }) => user;

  return Array.isArray(data)
    ? data.map(sanitize)
    : sanitize(data);
};

export const postUser = async (data) => {
  let existingUser = await usersRepository.findByEmailActive(data.email);

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_IN_USE');
  }

  existingUser = await usersRepository.findByUserNameActive(data.userName);

  if (existingUser) {
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
    role: 'client',
    active: true,
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
    role: 'client',
    active: true,
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


export const update = async(id, payload) => {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }
    
    const data = { ...payload }

    if (payload.userName && payload.userName !== user.userName) {
      const exists = await usersRepository.findByUserNameActive(payload.userName)

      if (exists) {
        throw createError('UserName already exists', 409, 'USERNAME_ALREADY_EXISTS')
      }
    }
    if (payload.email && payload.email !== user.email) {
      const exists = await usersRepository.findByEmailActive(payload.email)

      if (exists) {
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

  if (user.active === false) {
    throw createError('User already deleted', 400, 'USER_ALREADY_DELETED');
  }

  const updated = await usersRepository.softDelete(userId);

  return removeSensitiveFields(updated);
};
