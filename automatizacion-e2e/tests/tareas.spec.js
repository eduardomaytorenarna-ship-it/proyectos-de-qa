import { test, expect } from '@playwright/test';
import { registrarse, agregarTarea, nuevoUsuario } from './helpers.js';

test.describe('Gestion de tareas', () => {
  test.beforeEach(async ({ page }) => {
    await registrarse(page);
  });

  test('crea una tarea y aparece en la lista', async ({ page }) => {
    await agregarTarea(page, 'Escribir el plan de pruebas');
    await expect(page.getByText('Escribir el plan de pruebas')).toBeVisible();
    await expect(page.getByText('1 pendiente')).toBeVisible();
  });

  test('el boton Agregar esta deshabilitado con el campo vacio', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Agregar' })).toBeDisabled();
    await page.getByLabel('Nueva tarea').fill('algo');
    await expect(page.getByRole('button', { name: 'Agregar' })).toBeEnabled();
  });

  test('marca una tarea como completada y el contador baja', async ({ page }) => {
    await agregarTarea(page, 'Tarea por completar');
    await expect(page.getByText('1 pendiente')).toBeVisible();

    // Se usa click() y no check(): la interfaz no es optimista, espera la
    // respuesta de la API antes de reflejar el cambio, y check() exige que
    // el estado cambie de inmediato.
    await page.getByRole('checkbox').click();

    await expect(page.getByRole('checkbox')).toBeChecked();
    await expect(page.getByText('0 pendientes')).toBeVisible();
    await expect(page.locator('li.done')).toHaveCount(1);
  });

  test('desmarca una tarea completada', async ({ page }) => {
    await agregarTarea(page, 'Ida y vuelta');
    await page.getByRole('checkbox').click();
    await expect(page.getByText('0 pendientes')).toBeVisible();

    await page.getByRole('checkbox').click();
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByText('1 pendiente')).toBeVisible();
    await expect(page.locator('li.done')).toHaveCount(0);
  });

  test('elimina una tarea', async ({ page }) => {
    await agregarTarea(page, 'Tarea desechable');
    await page.getByRole('button', { name: 'Eliminar Tarea desechable' }).click();

    await expect(page.getByText('Tarea desechable')).toHaveCount(0);
    await expect(page.getByText('Todavia no tienes tareas. Agrega la primera arriba.')).toBeVisible();
  });

  test('maneja varias tareas y cuenta solo las pendientes', async ({ page }) => {
    await agregarTarea(page, 'Primera');
    await agregarTarea(page, 'Segunda');
    await agregarTarea(page, 'Tercera');
    await expect(page.getByText('3 pendientes')).toBeVisible();

    await page.getByRole('checkbox').first().click();
    await expect(page.getByText('2 pendientes')).toBeVisible();
    await expect(page.locator('li')).toHaveCount(3);
  });

  test('las tareas persisten despues de recargar', async ({ page }) => {
    await agregarTarea(page, 'Sobrevive al refresh');
    await page.reload();
    await expect(page.getByText('Sobrevive al refresh')).toBeVisible();
  });

  test('el campo se limpia despues de agregar', async ({ page }) => {
    await agregarTarea(page, 'Limpia el campo');
    await expect(page.getByLabel('Nueva tarea')).toHaveValue('');
  });
});

test.describe('Aislamiento entre usuarios', () => {
  // Este es el caso de seguridad que mas importa: que un usuario no vea
  // las tareas de otro. Se valida contra la interfaz, extremo a extremo.
  test('un usuario no ve las tareas de otro', async ({ page }) => {
    await registrarse(page);
    await agregarTarea(page, 'Tarea privada del usuario A');
    await page.getByRole('button', { name: 'Cerrar sesion' }).click();

    await page.getByRole('button', { name: 'No tengo cuenta, quiero registrarme' }).click();
    const usuarioB = nuevoUsuario();
    await page.getByLabel('Email').fill(usuarioB.email);
    await page.getByLabel('Contrasena').fill(usuarioB.password);
    await page.getByRole('button', { name: 'Registrarme' }).click();

    await expect(page.getByRole('heading', { name: 'Mis tareas' })).toBeVisible();
    await expect(page.getByText('Tarea privada del usuario A')).toHaveCount(0);
    await expect(page.getByText('Todavia no tienes tareas. Agrega la primera arriba.')).toBeVisible();
  });
});
