import { test, expect } from '@playwright/test';
import { AuthPage, TareasPage, nuevoUsuario } from './helpers.js';

test.describe('Gestion de tareas (POM)', () => {
  let authPage;
  let tareasPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    tareasPage = new TareasPage(page);
    const usuario = nuevoUsuario();
    await authPage.registrar(usuario.email, usuario.password);
    await tareasPage.esperarCarga();
  });

  test('crea una tarea y aparece en la lista', async () => {
    await tareasPage.agregarTarea('Escribir el plan de pruebas');
    await expect(tareasPage.obtenerTarea('Escribir el plan de pruebas')).toBeVisible();
    await tareasPage.esperarContador('1 pendiente');
  });

  test('el boton Agregar esta deshabilitado con el campo vacio', async () => {
    await expect(tareasPage.addButton).toBeDisabled();
    await tareasPage.newTaskInput.fill('algo');
    await expect(tareasPage.addButton).toBeEnabled();
  });

  test('marca una tarea como completada y el contador baja', async () => {
    await tareasPage.agregarTarea('Tarea por completar');
    await tareasPage.esperarContador('1 pendiente');

    // Se usa click() y no check(): la interfaz no es optimista, espera la
    // respuesta de la API antes de reflejar el cambio, y check() exige que
    // el estado cambie de inmediato.
    await tareasPage.marcarTarea('Tarea por completar');

    await expect(tareasPage.obtenerCheckbox('Tarea por completar')).toBeChecked();
    await tareasPage.esperarContador('0 pendientes');
    await expect(tareasPage.completedItems).toHaveCount(1);
  });

  test('desmarca una tarea completada', async () => {
    await tareasPage.agregarTarea('Ida y vuelta');
    await tareasPage.marcarTarea('Ida y vuelta');
    await tareasPage.esperarContador('0 pendientes');

    await tareasPage.marcarTarea('Ida y vuelta');
    await expect(tareasPage.obtenerCheckbox('Ida y vuelta')).not.toBeChecked();
    await tareasPage.esperarContador('1 pendiente');
    await expect(tareasPage.completedItems).toHaveCount(0);
  });

  test('elimina una tarea', async () => {
    await tareasPage.agregarTarea('Tarea desechable');
    await tareasPage.eliminarTarea('Tarea desechable');

    await expect(tareasPage.obtenerTarea('Tarea desechable')).toHaveCount(0);
    await tareasPage.esperarMensajeVacio();
  });

  test('maneja varias tareas y cuenta solo las pendientes', async () => {
    await tareasPage.agregarTarea('Primera');
    await tareasPage.agregarTarea('Segunda');
    await tareasPage.agregarTarea('Tercera');
    await tareasPage.esperarContador('3 pendientes');

    await tareasPage.marcarTarea('Primera');
    await tareasPage.esperarContador('2 pendientes');
    await expect(tareasPage.taskItems).toHaveCount(3);
  });

  test('las tareas persisten despues de recargar', async ({ page }) => {
    await tareasPage.agregarTarea('Sobrevive al refresh');
    await page.reload();
    await expect(tareasPage.obtenerTarea('Sobrevive al refresh')).toBeVisible();
  });

  test('el campo se limpia despues de agregar', async () => {
    await tareasPage.agregarTarea('Limpia el campo');
    await expect(tareasPage.newTaskInput).toHaveValue('');
  });
});

test.describe('Aislamiento entre usuarios (POM)', () => {
  // Este es el caso de seguridad que mas importa: que un usuario no vea
  // las tareas de otro. Se valida contra la interfaz, extremo a extremo.
  test('un usuario no ve las tareas de otro', async ({ page }) => {
    const authPage = new AuthPage(page);
    const tareasPage = new TareasPage(page);

    const usuarioA = nuevoUsuario();
    await authPage.registrar(usuarioA.email, usuarioA.password);
    await tareasPage.esperarCarga();
    await tareasPage.agregarTarea('Tarea privada del usuario A');
    await tareasPage.cerrarSesion();

    const usuarioB = nuevoUsuario();
    await authPage.registrar(usuarioB.email, usuarioB.password);
    await tareasPage.esperarCarga();

    await expect(tareasPage.obtenerTarea('Tarea privada del usuario A')).toHaveCount(0);
    await tareasPage.esperarMensajeVacio();
  });
});
