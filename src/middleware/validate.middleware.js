import { errorResponse } from '../utils/response.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return errorResponse(
        res,
        'Invalid data',
        'VALIDATION_ERROR',
        result.error.errors,
        400
      );
    }

    req.validatedData = result.data;
    next();
  };
};