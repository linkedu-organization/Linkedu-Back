import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Candidato, Perfil, Recrutador, TipoPerfil } from '@prisma/client';

import { InternalServerError } from '../errors/InternalServerError';
import { NoPermissionError } from '../errors/NoPermissionError';
import { InvalidTokenError } from '../errors/InvalidTokenError';

type PerfilWithRelations = Perfil & {
  recrutador?: Recrutador | null;
  candidato?: Candidato | null;
};

export const COOKIE_EXPIRATION_HOURS = 4;
export const COOKIE_EXPIRATION_SECONDS = COOKIE_EXPIRATION_HOURS * 60 * 60;
export const COOKIE_EXPIRATION_MS = COOKIE_EXPIRATION_SECONDS * 1000;

export const gerarHashSenha = async (senha: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
};

export const gerarAuthToken = (perfil: PerfilWithRelations) => {
  if (!process.env.JWT_SECRET) {
    throw new InternalServerError();
  }

  const payload = {
    id: perfil.recrutador?.id ?? perfil.candidato?.id,
    perfilId: perfil.id,
    role: perfil.tipo,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: COOKIE_EXPIRATION_SECONDS,
  });

  return `Bearer ${token}`;
};

export const getAuthTokenId = (authToken: unknown) => {
  if (!authToken || typeof authToken !== 'object' || !('id' in authToken)) {
    throw new InvalidTokenError();
  }
  return Number(authToken.id);
};

export const getAuthTokenIdAndRole = (authToken: unknown) => {
  if (!authToken || typeof authToken !== 'object' || !('id' in authToken) || !('role' in authToken)) {
    throw new InvalidTokenError();
  }
  const authTokenId = Number(authToken.id);
  const role = authToken.role as TipoPerfil;
  return { authTokenId, role };
};

export const ensureSelfTargetedAction = (id: number, authToken: unknown) => {
  const authTokenId = getAuthTokenId(authToken);
  if (id !== authTokenId) {
    throw new NoPermissionError();
  }
};
