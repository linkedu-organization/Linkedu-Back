import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import cookieParser from 'cookie-parser';

import { routes } from './routes/routes';
import { AppError } from './errors/AppError';

const app = express();
const port = process.env.PORT ?? 3333;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.disable('x-powered-by');

app.use(express.json());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(cookieParser());
app.use('/api', routes);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map(error => ({
      message: `${error.path.join('.')}: ${error.message}`,
    }));
    res.status(400).json({ errors: formattedErrors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Erro do servidor' });
};

app.use(errorHandler);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
