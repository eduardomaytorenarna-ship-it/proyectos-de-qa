# Casos de prueba - SauceDemo

Convencion de ID: `[Modulo]-[Numero]`. Prioridad: Alta / Media / Baja.

## Login

| ID | Descripcion | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| LOGIN-01 | Login exitoso con usuario valido | 1. Ir a saucedemo.com 2. Ingresar `standard_user` / `secret_sauce` 3. Click en Login | Redirige a `/inventory.html` y muestra el catalogo | Alta |
| LOGIN-02 | Login con password incorrecto | 1. Ingresar `standard_user` / password invalido 2. Click en Login | Muestra mensaje de error, no redirige | Alta |
| LOGIN-03 | Login con usuario bloqueado | 1. Ingresar `locked_out_user` / `secret_sauce` | Muestra "Sorry, this user has been locked out" | Alta |
| LOGIN-04 | Login con campos vacios | 1. Dejar usuario y password vacios 2. Click en Login | Muestra "Username is required" | Media |
| LOGIN-05 | Login con usuario valido pero sin password | 1. Ingresar solo usuario 2. Click en Login | Muestra "Password is required" | Media |

## Catalogo / Inventario

| ID | Descripcion | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| INV-01 | Ordenar productos de A a Z | 1. Login valido 2. Seleccionar orden "Name (A to Z)" | Lista se reordena alfabeticamente ascendente | Media |
| INV-02 | Ordenar productos por precio | 1. Login valido 2. Seleccionar orden "Price (low to high)" | Lista se reordena de menor a mayor precio | Media |
| INV-03 | Ver detalle de un producto | 1. Login valido 2. Click en el nombre de un producto | Muestra pagina de detalle con imagen, descripcion y precio | Alta |
| INV-04 | Catalogo con problem_user | 1. Login con `problem_user` | Verificar si las imagenes/orden se rompen (bug conocido del sitio) | Media |
