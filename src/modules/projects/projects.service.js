import * as repository from './projects.repository.js';

export const createProject = async (data,userId) => {

  return repository.createProject({
    ...data,
    ownerId: userId,
    status: 'ACTIVE',
    members: [
      {
        userId,
        role: 'PROJECT_MANAGER',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getProjects = async () => {
  return repository.getProjects();
};

export const getProjectById = async (id) => {
  return repository.getProjectById(id);
};