/** Cada prueba usa un email unico para no chocar con datos de corridas previas. */
export function nuevoUsuario() {
  const marca = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return { email: `e2e-${marca}@prueba.com`, password: 'secret123' };
}

/** Registra un usuario nuevo desde la interfaz y deja la sesion iniciada. */
export async function registrarse(page, usuario = nuevoUsuario()) {
  await page.goto('/');
  await page.getByRole('button', { name: 'No tengo cuenta, quiero registrarme' }).click();
  await page.getByLabel('Email').fill(usuario.email);
  await page.getByLabel('Contrasena').fill(usuario.password);
  await page.getByRole('button', { name: 'Registrarme' }).click();
  await page.getByRole('heading', { name: 'Mis tareas' }).waitFor();
  return usuario;
}

/** Agrega una tarea desde la interfaz y espera a que aparezca en la lista. */
export async function agregarTarea(page, titulo) {
  await page.getByLabel('Nueva tarea').fill(titulo);
  await page.getByRole('button', { name: 'Agregar' }).click();
  await page.getByText(titulo, { exact: true }).waitFor();
}
