import { rolesRepository } from './roles.repository.js';


const removeSensitiveFields = (data) => {
  if (!data) return data;

  const sanitize = ({ passwordHash, tokenVersion, ...user }) => user;

  return Array.isArray(data)
    ? data.map(sanitize)
    : sanitize(data);
};

export const getRoles = async () => {
  const roles = await rolesRepository.getRoles();
  if (roles.length === 0) {
    throw new Error('ROLES_DATABASE_EMPTY');
  }
  
  return removeSensitiveFields(roles);
};


