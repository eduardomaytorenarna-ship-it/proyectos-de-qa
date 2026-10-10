import { test, expect } from '@playwright/test';
import { AuthPage, TareasPage, nuevoUsuario } from './helpers.js';

test.describe('Autenticacion (POM)', () => {
  let authPage;
  let tareasPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    tareasPage = new TareasPage(page);
  });

  test('un usuario nuevo puede registrarse y entra a su lista de tareas', async () => {
    const usuario = nuevoUsuario();
    await authPage.registrar(usuario.email, usuario.password);

    await tareasPage.esperarCarga();
    await tareasPage.esperarMensajeVacio();
  });

  test('un usuario registrado puede cerrar e iniciar sesion de nuevo', async () => {
    const usuario = nuevoUsuario();
    await authPage.registrar(usuario.email, usuario.password);
    await tareasPage.esperarCarga();

    await tareasPage.cerrarSesion();
    await authPage.esperarPantallaLogin();

    await authPage.iniciarSesion(usuario.email, usuario.password);
    await tareasPage.esperarCarga();
  });

  test('rechaza credenciales invalidas y muestra el error', async () => {
    const usuario = nuevoUsuario();
    await authPage.registrar(usuario.email, usuario.password);
    await tareasPage.esperarCarga();

    await tareasPage.cerrarSesion();
    await authPage.iniciarSesion(usuario.email, 'contrasena-incorrecta');

    await authPage.esperarError('Credenciales invalidas');
    await authPage.esperarPantallaLogin();
  });

  test('rechaza un email ya registrado', async () => {
    const usuario = nuevoUsuario();
    await authPage.registrar(usuario.email, usuario.password);
    await tareasPage.esperarCarga();

    await tareasPage.cerrarSesion();
    await authPage.registrar(usuario.email, usuario.password);

    await authPage.esperarError('El email ya esta registrado');
  });

  test('la sesion sobrevive a recargar la pagina', async () => {
    const usuario = nuevoUsuario();
    await authPage.registrar(usuario.email, usuario.password);
    await tareasPage.esperarCarga();

    await authPage.page.reload();
    await tareasPage.esperarCarga();
  });

  test('sin sesion, la app muestra la pantalla de login', async () => {
    await authPage.goto();
    await authPage.esperarPantallaLogin();
  });
});
