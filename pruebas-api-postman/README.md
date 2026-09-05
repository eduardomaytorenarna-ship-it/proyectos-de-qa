# Pruebas de API con Postman

Coleccion de Postman para la
[API del gestor de tareas](https://github.com/eduardo-mr1/proyectos-de-programacion/tree/main/api-gestor-tareas),
ejecutable tanto desde la interfaz de Postman como desde la linea de comandos
con Newman.

**25 peticiones · 96 aserciones · 4 carpetas**

## Como correrlo

Con la API levantada en `http://localhost:3000`:

```bash
npm install
npm test              # salida en consola
npm run test:reporte  # ademas genera reporte/newman.html
```

Para apuntar a otro entorno, edita `baseUrl` en `entorno.local.json` o pasa otro
archivo de entorno:

```bash
npx newman run coleccion.json -e entorno.staging.json
```

Para usarla desde la interfaz de Postman: **Import** → `coleccion.json`, y
despues importa `entorno.local.json` como Environment.

## Que cubre

| Carpeta | Peticiones | Enfoque |
|---|---|---|
| Salud | 1 | Disponibilidad y tiempo de respuesta |
| Autenticacion | 9 | Registro, login, duplicados, politica de contrasena, email insensible a mayusculas |
| Tareas | 11 | CRUD completo, validacion de titulo, paginacion, tipos del contrato |
| Seguridad | 4 | Token ausente, invalido y mal formado; ruta inexistente |

### Aserciones globales

Se aplican a **todas** las peticiones desde el script de coleccion, sin
repetirlas una por una:

- Cada respuesta llega en menos de 2 segundos.
- Cada respuesta es JSON valido (salvo el `204`, que no lleva cuerpo).

## Encadenamiento de variables

La coleccion se ejecuta de principio a fin sin intervencion manual:

1. El registro genera un email unico con `Date.now()` en un script de
   pre-request, para que la corrida sea repetible sin limpiar la base.
2. El token de la respuesta se guarda en `{{token}}` y lo usan todas las
   peticiones autenticadas.
3. El `id` de la tarea creada se guarda en `{{taskId}}` y lo consumen el
   `PATCH` y el `DELETE`.

## Pruebas de contrato

Buena parte de las aserciones no verifican solo el codigo de estado sino la
**forma y el tipo** de la respuesta. Por ejemplo:

```javascript
pm.test('la respuesta trae la forma paginada', () => {
  pm.expect(b).to.have.all.keys('tasks', 'total', 'limit', 'offset');
  pm.expect(b.tasks).to.be.an('array');
});

pm.test('done es booleano y arranca en false (BUG-006)', () => {
  pm.expect(t.done).to.be.a('boolean');
  pm.expect(t.done).to.eql(false);
});
```

Varias estan marcadas con el identificador del hallazgo del
[reporte de bugs](../reporte-de-bugs) que las motivo: son las que impiden que
esos defectos vuelvan por la puerta de la API.

## Relacion con las otras suites

Las tres capas prueban cosas distintas y ninguna reemplaza a las otras:

| Suite | Nivel | Que responde |
|---|---|---|
| `node:test` (en el repo de la app) | Integracion | La logica interna funciona |
| **Esta coleccion** | Contrato de API | La API cumple lo que promete a cualquier cliente |
| [`automatizacion-e2e`](../automatizacion-e2e) | Extremo a extremo | El usuario puede completar sus flujos |

El valor propio de esta capa es que **no requiere saber programar** para
ejecutarse ni extenderse: un QA manual la abre en Postman, ve cada peticion y
agrega casos sin tocar codigo de la aplicacion.

## Limitaciones conocidas

- **No cubre el limitador de intentos de login.** Disparar los 5 intentos
  fallidos dejaria bloqueado el email por 15 minutos y volveria la corrida no
  repetible. Eso queda cubierto por las pruebas de regresion de la API, que usan
  una base en memoria.
- **Sin pruebas de carga.** Newman puede iterar con `-n`, pero medir rendimiento
  pide una herramienta dedicada como k6 o JMeter.
