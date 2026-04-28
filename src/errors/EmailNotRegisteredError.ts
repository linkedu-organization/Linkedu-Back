import { AppError } from './AppError';

export class EmailNotRegisteredError extends AppError {
  constructor() {
    super('Email não cadastrado', 404);
  }
}
