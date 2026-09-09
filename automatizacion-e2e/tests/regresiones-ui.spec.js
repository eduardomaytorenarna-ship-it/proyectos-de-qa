// Comprobaciones de no-regresion para los hallazgos de interfaz del
// reporte de bugs (repo proyectos-de-qa/reporte-de-bugs).
//
// Viven aqui, y no junto al reporte, porque este es el proyecto que ya tiene
// Playwright configurado y cobertura de CI. Un spec suelto en otra carpeta no
// lo corre nadie, y fue justamente asi como la version anterior de estas
// comprobaciones quedo obsoleta sin que nadie lo notara.
import { test, expect } from '@playwright/test';
import { registrarse, agregarTarea } from './helpers.js';

test('BUG-003: un titulo largo no desborda la pagina', async ({ page }) => {
  await registrarse(page);
  await agregarTarea(page, 'A'.repeat(200)); // 200 = maximo que acepta la API

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  expect(scrollWidth, 'la pagina no debe desbordarse horizontalmente')
    .toBeLessThanOrEqual(innerWidth + 1);
});

test('BUG-003: la API rechaza un titulo por encima del limite', async ({ page }) => {
  await registrarse(page);
  const status = await page.evaluate(async () => {
    const token = localStorage.getItem('gestor-tareas-token');
    const r = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'A'.repeat(600) }),
    });
    return r.status;
  });
  expect(status).toBe(400);
});

test('BUG-008: el checkbox refleja el click de inmediato', async ({ page }) => {
  await registrarse(page);
  await agregarTarea(page, 'Respuesta inmediata');

  // check() exige que el estado cambie apenas se hace click. Fallaba cuando la
  // interfaz esperaba la respuesta del servidor; con la actualizacion
  // optimista pasa.
  await page.getByRole('checkbox').check({ timeout: 1000 });
  await expect(page.getByRole('checkbox')).toBeChecked();
  await expect(page.getByText('0 pendientes')).toBeVisible();
});
