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

## Carrito de compras

| ID | Descripcion | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| CART-01 | Agregar un producto al carrito | 1. Login valido 2. Click "Add to cart" en un producto | Contador del carrito incrementa a 1, boton cambia a "Remove" | Alta |
| CART-02 | Quitar un producto del carrito | 1. Con un producto agregado 2. Click "Remove" | Contador vuelve a 0, producto ya no aparece en el carrito | Alta |
| CART-03 | Persistencia del carrito al navegar | 1. Agregar producto 2. Ir al detalle de otro producto y regresar | El producto sigue en el carrito | Media |
| CART-04 | Carrito vacio muestra checkout deshabilitado logicamente | 1. Ir al carrito sin productos | No debe permitir avanzar a un checkout con orden vacia | Baja |

## Checkout

| ID | Descripcion | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| CHK-01 | Checkout completo exitoso | 1. Agregar producto 2. Ir a carrito 3. Checkout 4. Llenar nombre, apellido, codigo postal 5. Continue 6. Finish | Muestra "Thank you for your order!" | Alta |
| CHK-02 | Checkout con campos obligatorios vacios | 1. Ir a checkout 2. Dejar campos vacios 3. Continue | Muestra "Error: First Name is required" (o el campo correspondiente) | Alta |
| CHK-03 | Resumen de orden muestra total correcto | 1. Agregar 2 productos 2. Avanzar a "Checkout: Overview" | Subtotal, tax y total coinciden con la suma de precios | Alta |
| CHK-04 | Cancelar checkout regresa al carrito | 1. Iniciar checkout 2. Click "Cancel" | Regresa a la pagina del carrito sin perder los productos | Baja |
