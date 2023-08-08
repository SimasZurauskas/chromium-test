import bcrypt from 'bcryptjs';

export const generate = async (psw: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(psw, salt);

  return hash;
};
