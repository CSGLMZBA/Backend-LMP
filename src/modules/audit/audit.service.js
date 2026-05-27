import { auditRepository } from './audit.repository.js';

export const register = async (data) => {

  const audit = await auditRepository.create({
    ...data
  });

  return audit;
};


export const get = async () => {

  const audit = await auditRepository.get();
  if (audit.length === 0)
  {
    throw new Error("DATABASE_EMPTY");
  }
  return audit;
};
