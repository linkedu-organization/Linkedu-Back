import { AppError } from './AppError';

export class InternalServerError extends AppError {
  constructor() {
    super('Erro do servidor', 500);
  }
}
