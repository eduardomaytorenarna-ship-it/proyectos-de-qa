import express from 'express';
import { createDb } from './db.js';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { tasksRouter } from './routes/tasks.js';

export function createApp({ dbPath = 'data.sqlite', jwtSecret = process.env.JWT_SECRET || 'dev-secret' } = {}) {
  const db = createDb(dbPath);
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/auth', authRouter(db, jwtSecret));
  app.use('/tasks', requireAuth(jwtSecret), tasksRouter(db));

  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API escuchando en el puerto ${port}`));
}
