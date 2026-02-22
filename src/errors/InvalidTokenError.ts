import { AppError } from './AppError';

export class InvalidTokenError extends AppError {
  constructor() {
    super('Token inválido', 401);
  }
}
