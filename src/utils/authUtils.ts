import bcrypt from 'bcrypt';

export const gerarHashSenha = async (senha: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
};
