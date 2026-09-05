# API Gestor de Tareas

API REST para gestionar tareas por usuario, con autenticacion JWT.

## Stack

- Node.js + Express 5
- SQLite (better-sqlite3) como base de datos embebida
- JWT (jsonwebtoken) para autenticacion
- bcryptjs para hash de contrasenas
- Zod para validacion de entrada
- Test runner nativo de Node (`node:test`) - sin dependencias extra de testing

## Endpoints

| Metodo | Ruta | Descripcion | Auth |
|---|---|---|---|
| POST | /auth/register | Crear cuenta, devuelve JWT | No |
| POST | /auth/login | Iniciar sesion, devuelve JWT | No |
| GET | /tasks | Listar tareas del usuario autenticado | Si |
| POST | /tasks | Crear tarea | Si |
| PATCH | /tasks/:id | Editar titulo o marcar como completada | Si |
| DELETE | /tasks/:id | Eliminar tarea | Si |

## Como correrlo

```bash
npm install
npm start        # levanta en http://localhost:3000
npm test         # corre la suite de pruebas
```

## Diseno

- Cada usuario solo puede ver/editar sus propias tareas (aislamiento por `user_id` en cada query).
- Contrasenas nunca se guardan en texto plano (bcrypt).
- Validacion de entrada con Zod antes de tocar la base de datos.
- Pruebas de integracion levantan la app completa en memoria (`:memory:`) y pegan por HTTP real con `fetch`, sin mocks.
