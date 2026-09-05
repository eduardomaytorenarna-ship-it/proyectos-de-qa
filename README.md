# Proyectos de QA — Eduardo Maytorena

[![CI E2E](https://github.com/eduardo-mr1/proyectos-de-qa/actions/workflows/ci-e2e.yml/badge.svg)](https://github.com/eduardo-mr1/proyectos-de-qa/actions/workflows/ci-e2e.yml)
[![CI API Postman](https://github.com/eduardo-mr1/proyectos-de-qa/actions/workflows/ci-api-postman.yml/badge.svg)](https://github.com/eduardo-mr1/proyectos-de-qa/actions/workflows/ci-api-postman.yml)

Trabajo de aseguramiento de calidad sobre una aplicacion real: diseno de
pruebas, automatizacion de interfaz, pruebas de contrato de API y reporte de
defectos.

La aplicacion bajo prueba es un gestor de tareas (API en Node/Express + cliente
en React) que vive en
**[proyectos-de-programacion](https://github.com/eduardo-mr1/proyectos-de-programacion)**.
Tener el repositorio de pruebas separado del de producto es el patron habitual
en equipos de QA, y es lo que permite que la suite evolucione por su cuenta.

## Proyectos

### [Plan de pruebas](plan-de-pruebas)
Plan y **17 casos de prueba manuales** sobre [SauceDemo](https://www.saucedemo.com/):
objetivo, alcance, estrategia, criterios de entrada y salida, matriz de riesgos,
y casos organizados por modulo con prioridad.

Muestra el proceso de diseno de pruebas *antes* de automatizar.

### [Automatizacion E2E](automatizacion-e2e) · Playwright
**15 pruebas extremo a extremo** sobre la aplicacion completa: autenticacion,
CRUD de tareas y aislamiento entre usuarios verificado desde la interfaz.

Selectores por rol y etiqueta (no CSS fragil), cero esperas fijas, y evidencia
—trace y captura— solo cuando algo falla. CI levanta la aplicacion y corre la
suite en cada push.

### [Pruebas de API](pruebas-api-postman) · Postman + Newman
**25 peticiones y 96 aserciones** en 4 carpetas: salud, autenticacion, tareas y
seguridad.

Valida forma y tipos del contrato, no solo codigos de estado. Encadena variables
para correr de principio a fin sin intervencion, y se ejecuta igual desde la
interfaz de Postman que desde la linea de comandos en CI.

### [Reporte de bugs](reporte-de-bugs)
**8 defectos reales encontrados** en la aplicacion mediante testing exploratorio,
con severidad, pasos, causa raiz, evidencia y sugerencia de correccion.

Los 8 fueron corregidos y reverificados: cada uno enlaza al commit que lo
resuelve. Incluye una seccion de **hipotesis descartadas**, porque documentar lo
que resulto no ser un bug tambien es parte del trabajo.

Los dos mas graves:

| | |
|---|---|
| **BUG-001** | El email distinguia mayusculas: registrarse desde el celular (que capitaliza la primera letra) creaba una cuenta distinta, y al iniciar sesion en minusculas el usuario perdia acceso a sus tareas. |
| **BUG-002** | 30 intentos fallidos de login en 2 segundos sin ningun freno. Combinado con una politica que aceptaba `123456`. |

## El ciclo completo

Lo que conecta a los cuatro proyectos es que cubren el ciclo entero sobre la
misma aplicacion:

```
diseno de pruebas  →  automatizacion  →  hallazgo de defectos
                                                  ↓
        verificacion de cierre  ←  correccion con pruebas de regresion
```

El [reporte de bugs](reporte-de-bugs) documenta los defectos; el
[pull request que los corrige](https://github.com/eduardo-mr1/proyectos-de-programacion/pull/6)
agrega 12 pruebas de regresion, una por hallazgo, para que ninguno vuelva.

## Las tres capas de prueba

Cada una responde algo distinto y ninguna reemplaza a las otras:

| Capa | Herramienta | Que responde |
|---|---|---|
| Integracion | `node:test` (en el repo de la app) | La logica interna funciona |
| Contrato de API | Postman + Newman | La API cumple lo que promete a cualquier cliente |
| Extremo a extremo | Playwright | El usuario puede completar sus flujos |

## Stack

Playwright · Postman · Newman · Node.js · GitHub Actions
