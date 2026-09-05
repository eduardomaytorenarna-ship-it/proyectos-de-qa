import { test, expect } from '@playwright/test';
import { nuevoUsuario, registrarse } from './helpers.js';

test.describe('Autenticacion', () => {
  test('un usuario nuevo puede registrarse y entra a su lista de tareas', async ({ page }) => {
    await registrarse(page);
    await expect(page.getByRole('heading', { name: 'Mis tareas' })).toBeVisible();
    await expect(page.getByText('Todavia no tienes tareas. Agrega la primera arriba.')).toBeVisible();
  });

  test('un usuario registrado puede cerrar e iniciar sesion de nuevo', async ({ page }) => {
    const usuario = await registrarse(page);

    await page.getByRole('button', { name: 'Cerrar sesion' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesion' })).toBeVisible();

    await page.getByLabel('Email').fill(usuario.email);
    await page.getByLabel('Contrasena').fill(usuario.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Mis tareas' })).toBeVisible();
  });

  test('rechaza credenciales invalidas y muestra el error', async ({ page }) => {
    const usuario = await registrarse(page);
    await page.getByRole('button', { name: 'Cerrar sesion' }).click();

    await page.getByLabel('Email').fill(usuario.email);
    await page.getByLabel('Contrasena').fill('contrasena-incorrecta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toContainText('Credenciales invalidas');
    await expect(page.getByRole('heading', { name: 'Iniciar sesion' })).toBeVisible();
  });

  test('rechaza un email ya registrado', async ({ page }) => {
    const usuario = await registrarse(page);
    await page.getByRole('button', { name: 'Cerrar sesion' }).click();
    await page.getByRole('button', { name: 'No tengo cuenta, quiero registrarme' }).click();

    await page.getByLabel('Email').fill(usuario.email);
    await page.getByLabel('Contrasena').fill(usuario.password);
    await page.getByRole('button', { name: 'Registrarme' }).click();

    await expect(page.getByRole('alert')).toContainText('El email ya esta registrado');
  });

  test('la sesion sobrevive a recargar la pagina', async ({ page }) => {
    await registrarse(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Mis tareas' })).toBeVisible();
  });

  test('sin sesion, la app muestra la pantalla de login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Iniciar sesion' })).toBeVisible();
  });
});
