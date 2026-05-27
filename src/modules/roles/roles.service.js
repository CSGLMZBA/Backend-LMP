import { rolesRepository } from './roles.repository.js';


const removeSensitiveFields = (data) => {
  if (!data) return data;

  const sanitize = ({ passwordHash, tokenVersion, ...user }) => user;

  return Array.isArray(data)
    ? data.map(sanitize)
    : sanitize(data);
};

export const getRoles = async () => {
  const roles = await rolesRepository.get();
  if (roles.length === 0) {
    throw new Error('ROLES_DATABASE_EMPTY');
  }
  
  return removeSensitiveFields(roles);
};

export const postRole = async (data) =>
{
  const checkRoles = await rolesRepository.findByNameActive(data.roleName);

  if(checkRoles)
  {
    throw new Error('NAME_ALREADY_EXISTS');
  }
  const role = await rolesRepository.create(data);

  if (!role)
  {
    throw new Error('ERROR_CREATING_ROLE');
  }
  return removeSensitiveFields(role);
}

export const putRole = async (roleId, data) => {
  const role = await rolesRepository.findById(roleId);

  if (!role) {
    throw new Error('ROLE_NOT_FOUND');
  }

  const roleNew = await rolesRepository.update(roleId,{
    roleName: data.roleName,
    roleLevel: data.roleLevel
  });

  return removeSensitiveFields(roleNew);
};

export const softDelete = async (roleId) => {
  const role = await rolesRepository.findById(roleId);

  if (!role) {
    throw new Error('ROLE_NOT_FOUND');
  }

  if (role.active === false) {
    throw new Error('ROLE_ALREADY_DELETED');
  }

  const updated = await rolesRepository.softDelete(roleId);

  return removeSensitiveFields(updated);
};
