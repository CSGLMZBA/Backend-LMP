import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const app = express();
const allowedOrigins = env.CORS_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());
app.use('/api', routes);

app.use(errorMiddleware);

export default app;
