import * as service from './projects.service.js';

import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';

export const createProject = async (req, res) => {
  try {
    const project =
      await service.createProject(req.validatedData, req.user.id);
    return successResponse(res, 'Proyecto creado', project, 201);
  } catch (error) {
    return errorResponse(
      res,
      'Error al crear proyecto'
    );
  }
};

export const getProjects = async (req, res) => {
  const projects = await service.getProjects();
  return successResponse(
    res,
    'Proyectos obtenidos',
    projects
  );
};