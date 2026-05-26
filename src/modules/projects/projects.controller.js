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
  try {
    const projects = await service.getProjects(req.user.id);
    return successResponse(
      res,
      'Proyectos obtenidos',
      projects
    );
  } catch (error) {
    return errorResponse(
      res,
      'Error al obtener proyectos',
      'PROJECTS_ERROR',
      [error.message],
      500
    );
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await service.getProjectById(
      req.params.projectId,
      req.user.id
    );

    return successResponse(res, 'Proyecto obtenido', project);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return errorResponse(
        res,
        'Proyecto no encontrado',
        'PROJECT_NOT_FOUND',
        [],
        404
      );
    }

    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'No tienes permiso para ver este proyecto',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }

    return errorResponse(res, 'Error al obtener proyecto');
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await service.updateProject(
      req.params.projectId,
      req.validatedData,
      req.user.id
    );

    return successResponse(res, 'Proyecto actualizado', project);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return errorResponse(
        res,
        'Proyecto no encontrado',
        'PROJECT_NOT_FOUND',
        [],
        404
      );
    }

    if (
      error.message === 'UNAUTHORIZED_TEAM_ACCESS' ||
      error.message === 'INSUFFICIENT_TEAM_ROLE'
    ) {
      return errorResponse(
        res,
        'No tienes permiso para modificar este proyecto',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error al actualizar proyecto');
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const project = await service.updateProjectStatus(
      req.params.projectId,
      req.validatedData.status,
      req.user.id
    );

    return successResponse(res, 'Estatus de proyecto actualizado', project);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return errorResponse(
        res,
        'Proyecto no encontrado',
        'PROJECT_NOT_FOUND',
        [],
        404
      );
    }

    if (
      error.message === 'UNAUTHORIZED_TEAM_ACCESS' ||
      error.message === 'INSUFFICIENT_TEAM_ROLE'
    ) {
      return errorResponse(
        res,
        'No tienes permiso para modificar este proyecto',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error al cambiar estatus de proyecto');
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await service.deleteProject(
      req.params.projectId,
      req.user.id
    );

    return successResponse(res, 'Proyecto eliminado', project);
  } catch (error) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return errorResponse(
        res,
        'Proyecto no encontrado',
        'PROJECT_NOT_FOUND',
        [],
        404
      );
    }

    if (
      error.message === 'UNAUTHORIZED_TEAM_ACCESS' ||
      error.message === 'INSUFFICIENT_TEAM_ROLE'
    ) {
      return errorResponse(
        res,
        'No tienes permiso para eliminar este proyecto',
        error.message,
        [],
        403
      );
    }

    return errorResponse(res, 'Error al eliminar proyecto');
  }
};
