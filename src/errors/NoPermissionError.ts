import { AppError } from './AppError';

export class NoPermissionError extends AppError {
  constructor() {
    super('Acesso negado. Você não tem permissão para essa ação', 403);
  }
}
