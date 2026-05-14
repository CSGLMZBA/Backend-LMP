import * as authService from './auth.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const register = async (req, res) => {
  try {
    const usuario = await authService.register(
      req.datosValidados
    );

    return successResponse(
      res,
      'Usuario registrado',
      usuario,
      201
    );
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Ya existe un usuario con ese correo electrónico',
        'EMAIL_ALREADY_EXISTS',
        [],
        400
      );
    }

    return errorResponse(res, 'Error al registrar');
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(
      req.datosValidados
    );

    return successResponse(
      res,
      'Login exitoso',
      result
    );
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return errorResponse(
        res,
        'Credenciales inválidas',
        'INVALID_CREDENTIALS',
        [],
        401
      );
    }

    return errorResponse(
      res,
      'Error al iniciar sesión',
      'LOGIN_ERROR',
      [],
      500
    );
  }
};