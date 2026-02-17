import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TipoPerfil } from '@prisma/client';

import { AppError } from '../errors/AppError';
import { InternalServerError } from '../errors/InternalServerError';
import { TokenNotProvidedError } from '../errors/TokenNotProvidedError';
import { NoPermissionError } from '../errors/NoPermissionError';

const getDecryptedToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new InternalServerError();
  }

  try {
    const tokenWithoutBearer = token.split(' ')[1] || token;
    return jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Token inválido', 401);
  }
};

export const getAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;
  if (!token) {
    res.status(200).json({ autenticado: false });
    return;
  }

  res.locals.decryptedToken = getDecryptedToken(token);
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;
  if (!token) {
    throw new TokenNotProvidedError();
  }

  res.locals.decryptedToken = getDecryptedToken(token);
  next();
};

const ensureRole = (role: TipoPerfil) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.authToken;
    if (!token) {
      throw new TokenNotProvidedError();
    }

    const tokenInfo = getDecryptedToken(token);
    if (tokenInfo.role !== role) {
      throw new NoPermissionError();
    }

    res.locals.decryptedToken = tokenInfo;
    next();
  };
};

export const ensureIsRerutador = ensureRole(TipoPerfil.RECRUTADOR);
export const ensureIsCandidato = ensureRole(TipoPerfil.CANDIDATO);
