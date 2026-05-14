import { errorResponse } from '../utils/response.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Datos inválidos',
        'VALIDATION_ERROR',
        result.error.errors,
        400
      );
    }

    req.validatedData = result.data;

    next();
  };
};