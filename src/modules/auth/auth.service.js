import bcrypt from 'bcrypt'
import {
  createUser,
  findUserByEmail,
} from './auth.repository.js';

import { generateAccessToken } from '../../utils/jwt.js';

import { env } from '../../config/env.js';

export const register = async (data) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS); // Got rid of magic number for the salt rounds

  const user = await createUser({
    nombre: data.nombre,
    apaterno: data.apaterno,
    amaterno: data.amaterno,
    email: data.email,
    password: hashedPassword,
    rol: 'cliente',
    estado: 'activo',
    createdAt: new Date(),
  });

  delete user.password;

  return user;
};

export const login = async (data) => {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const validPassword = await bcrypt.compare(
    data.password,
    user.password
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