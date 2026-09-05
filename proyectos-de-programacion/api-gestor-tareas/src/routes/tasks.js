import { Router } from 'express';
import { z } from 'zod';

const createSchema = z.object({ title: z.string().min(1, 'El titulo es requerido') });
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
});

export function tasksRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC').all(req.user.sub);
    res.json(rows);
  });

  router.post('/', (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const info = db.prepare('INSERT INTO tasks (user_id, title) VALUES (?, ?)').run(req.user.sub, parsed.data.title);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(task);
  });

  router.patch('/:id', (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.sub);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const title = parsed.data.title ?? task.title;
    const done = parsed.data.done === undefined ? task.done : Number(parsed.data.done);
    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title, done, task.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id));
  });

  router.delete('/:id', (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.sub);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
    res.status(204).end();
  });

  return router;
}
