import { AppError } from './AppError';

export class EntityNotFoundError extends AppError {
  constructor(id: number) {
    super(`Entidade com id ${id} não encontrada`, 404);
  }
}
