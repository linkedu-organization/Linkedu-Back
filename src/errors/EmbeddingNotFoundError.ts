import { AppError } from './AppError';

export class EmbeddingNotFoundError extends AppError {
  constructor(id: number) {
    super(`Embedding da entidade com id ${id} não encontrado`, 404);
  }
}
