import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  return errorResponse(
    res,
    'Internal Server Error',
    'INTERNAL_SERVER_ERROR',
    [],
    500
  );
};