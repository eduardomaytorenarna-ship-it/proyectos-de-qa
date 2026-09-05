import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

export function authRouter(db, secret) {
  const router = Router();

  router.post('/register', (req, res) => {
    const parsed = credsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { email, password } = parsed.data;

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return res.status(409).json({ error: 'El email ya esta registrado' });

    const password_hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, password_hash);
    const token = jwt.sign({ sub: info.lastInsertRowid, email }, secret, { expiresIn: '1h' });
    res.status(201).json({ token });
  });

  router.post('/login', (req, res) => {
    const parsed = credsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { email, password } = parsed.data;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '1h' });
    res.json({ token });
  });

  return router;
}
