import { createApp } from '../src/app.js';

export function startTestApp() {
  const app = createApp({ dbPath: ':memory:', jwtSecret: 'test-secret' });
  const server = app.listen(0);
  const base = () => `http://127.0.0.1:${server.address().port}`;
  return { server, base };
}

export async function registerAndLogin(base, email = `user${Date.now()}@test.com`, password = 'secret123') {
  const res = await fetch(`${base()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return body.token;
}
