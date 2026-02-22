import { AppError } from './AppError';

export class TokenNotProvidedError extends AppError {
  constructor() {
    super('Token não fornecido', 401);
  }
}
