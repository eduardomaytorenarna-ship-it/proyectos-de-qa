import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestApp, registerAndLogin } from './helpers.js';

test('sin token, /tasks devuelve 401', async () => {
  const { server, base } = startTestApp();
  try {
    const res = await fetch(`${base()}/tasks`);
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('crear y listar una tarea', async () => {
  const { server, base } = startTestApp();
  try {
    const token = await registerAndLogin(base);
    const create = await fetch(`${base()}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Escribir pruebas' }),
    });
    assert.equal(create.status, 201);

    const list = await fetch(`${base()}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    const tasks = await list.json();
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].title, 'Escribir pruebas');
    assert.equal(tasks[0].done, 0);
  } finally {
    server.close();
  }
});

test('un usuario no puede ver tareas de otro usuario', async () => {
  const { server, base } = startTestApp();
  try {
    const tokenA = await registerAndLogin(base, 'a@test.com');
    const tokenB = await registerAndLogin(base, 'b@test.com');

    await fetch(`${base()}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Tarea de A' }),
    });

    const listB = await fetch(`${base()}/tasks`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const tasksB = await listB.json();
    assert.equal(tasksB.length, 0);
  } finally {
    server.close();
  }
});

test('marcar tarea como completada', async () => {
  const { server, base } = startTestApp();
  try {
    const token = await registerAndLogin(base);
    const create = await fetch(`${base()}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Completar esta' }),
    });
    const task = await create.json();

    const update = await fetch(`${base()}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ done: true }),
    });
    const updated = await update.json();
    assert.equal(updated.done, 1);
  } finally {
    server.close();
  }
});

test('borrar una tarea inexistente devuelve 404', async () => {
  const { server, base } = startTestApp();
  try {
    const token = await registerAndLogin(base);
    const res = await fetch(`${base()}/tasks/9999`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});
