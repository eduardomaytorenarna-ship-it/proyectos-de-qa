import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestApp } from './helpers.js';

test('registro exitoso devuelve un token', async () => {
  const { server, base } = startTestApp();
  try {
    const res = await fetch(`${base()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nuevo@test.com', password: 'secret123' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.token);
  } finally {
    server.close();
  }
});

test('registro duplicado devuelve 409', async () => {
  const { server, base } = startTestApp();
  try {
    const payload = { email: 'dup@test.com', password: 'secret123' };
    await fetch(`${base()}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const res = await fetch(`${base()}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    assert.equal(res.status, 409);
  } finally {
    server.close();
  }
});

test('login con password incorrecto devuelve 401', async () => {
  const { server, base } = startTestApp();
  try {
    await fetch(`${base()}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@test.com', password: 'secret123' }) });
    const res = await fetch(`${base()}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@test.com', password: 'incorrecta' }) });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('registro con password corto devuelve 400', async () => {
  const { server, base } = startTestApp();
  try {
    const res = await fetch(`${base()}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'x@test.com', password: '123' }) });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});
