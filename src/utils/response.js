import * as audit from '../middleware/audit.middleware.js'
import { normalizeTimestamps } from './timestamps.js';

export const successResponse = (
    res,
    message,
    data = {},
    status = 200,
    auditData = null
  ) => {
    const normalizedData = normalizeTimestamps(data);
    const jsonResponse =
    {
      success: true,
      message,  
      data: normalizedData
    }
    if(auditData !== null)
    {
      const log = {
        ...auditData,
        details: JSON.stringify(jsonResponse),
      }
      audit.LogAction(log);
    }
    return res.status(status).json(jsonResponse);
  };

export const errorResponse = (
  res,
  message,
  code = 'INTERNAL_ERROR',
  details = [],
  status = 500
) => {
  return res.status(status).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
};
