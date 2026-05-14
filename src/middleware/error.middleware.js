import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  return errorResponse(
    res,
    'Error interno del servidor',
    'INTERNAL_SERVER_ERROR',
    [],
    500
  );
};