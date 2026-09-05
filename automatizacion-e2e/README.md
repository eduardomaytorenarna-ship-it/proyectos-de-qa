# Automatizacion E2E

Suite de pruebas extremo a extremo con Playwright sobre el
[gestor de tareas](https://github.com/eduardo-mr1/proyectos-de-programacion):
API en Node/Express + cliente en React.

15 pruebas cubriendo autenticacion, CRUD de tareas y aislamiento entre usuarios.

## Por que la app bajo prueba vive en otro repositorio

Es el patron habitual en equipos de QA: el repositorio de pruebas es
independiente del de la aplicacion, para que la suite pueda evolucionar y
ejecutarse sin tocar el codigo de producto. El workflow de CI hace checkout de
ambos repositorios, levanta la aplicacion y corre las pruebas contra ella.

## Como correrlo en local

Necesitas la aplicacion corriendo. En dos terminales:

```bash
# terminal 1 - API
cd ../proyectos-de-programacion/api-gestor-tareas
npm install && npm start          # http://localhost:3000

# terminal 2 - frontend
cd ../proyectos-de-programacion/frontend-gestor-tareas
npm install && npm run dev        # http://localhost:5173
```

Y despues:

```bash
npm install
npx playwright install chromium
npm test                # modo headless
npm run test:headed     # viendo el navegador
npm run report          # abre el reporte HTML de la ultima corrida
```

Si sirves la app en otros puertos, pasa `APP_URL`:

```bash
APP_URL=http://localhost:4173 npm test
```

## Que se prueba

| Archivo | Cobertura |
|---|---|
| `tests/autenticacion.spec.js` | Registro, login, logout, credenciales invalidas, email duplicado, persistencia de sesion |
| `tests/tareas.spec.js` | Crear, completar, descompletar, eliminar, contador de pendientes, persistencia, aislamiento entre usuarios |

La prueba mas importante es la ultima: **un usuario no ve las tareas de otro**.
La API ya lo verifica a nivel de integracion, pero esta lo confirma desde la
interfaz, que es donde el usuario real lo experimenta.

## Decisiones de diseno

- **Selectores por rol y etiqueta** (`getByRole`, `getByLabel`) en vez de CSS o
  XPath. No se rompen cuando cambia una clase o la estructura del DOM, y de paso
  fallan si la accesibilidad se degrada: si un boton pierde su nombre accesible,
  la prueba lo detecta.
- **Sin `page.waitForTimeout`.** Todas las esperas son por condicion
  (`expect().toBeVisible()`, `waitFor()`), que es lo que evita las pruebas
  intermitentes.
- **Email unico por prueba.** Cada corrida genera usuarios nuevos, asi que la
  suite es repetible sin limpiar la base entre ejecuciones.
- **Ejecucion en serie** (`workers: 1`). La API usa una sola base SQLite; correr
  en paralelo introduciria contencion que no tiene que ver con lo que se prueba.
- **Evidencia solo en fallos.** Trace y screenshot con `retain-on-failure`
  mantienen las corridas verdes ligeras y dan contexto completo cuando hay que
  investigar.

## Un hallazgo de la implementacion

Las pruebas del checkbox fallaron en la primera version con
`locator.check: Clicking the checkbox did not change its state`.

La causa no era la prueba sino un comportamiento real de la aplicacion: la
interfaz **no es optimista**. Al marcar una tarea, el checkbox no cambia hasta
que la API responde, y `check()` de Playwright exige que el estado cambie
inmediatamente despues del click.

La suite usa `click()` y luego afirma el estado resultante con `toBeChecked()`,
que es la forma correcta de probar un control asincrono. En una red lenta el
usuario veria ese retraso, asi que queda anotado como candidato a mejora de UX
en la aplicacion (actualizacion optimista con reversion si la API falla).

## Limitaciones conocidas

- **Solo Chromium.** Agregar Firefox y WebKit es cambiar `projects` en la
  configuracion; se dejo en uno para que CI corra rapido.
- **Sin pruebas de responsive ni de dispositivos moviles.**
- **Sin pruebas de accesibilidad automatizadas.** Los selectores por rol dan
  cobertura indirecta, pero una auditoria con axe seria el siguiente paso.
