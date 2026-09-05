// Reproduccion automatizada de los hallazgos de interfaz.
// Requiere la API en :3000 y el frontend en :5173.
//   npx playwright test reproduccion/ui-bugs.spec.js
import { test, expect } from '@playwright/test';
import { registrarse, agregarTarea } from '../../automatizacion-e2e/tests/helpers.js';

test('BUG-003: un titulo largo desborda la pagina horizontalmente', async ({ page }) => {
  await registrarse(page);
  await agregarTarea(page, 'A'.repeat(600));
  await page.screenshot({ path: 'evidencia/bug-003-titulo-largo-rompe-layout.png', fullPage: true });

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  console.log(`scrollWidth=${scrollWidth}  innerWidth=${innerWidth}`);

  // Falla hoy: el texto no corta y estira el contenedor.
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
});

test('BUG-008: el checkbox no refleja el click hasta que responde la API', async ({ page }) => {
  await registrarse(page);
  await agregarTarea(page, 'Verificar respuesta inmediata');

  // check() exige que el estado cambie apenas se hace click. Falla porque la
  // interfaz espera la respuesta del servidor antes de actualizarse.
  await expect(async () => {
    await page.getByRole('checkbox').check({ timeout: 1000 });
  }).rejects.toThrow(/did not change its state/);
});
