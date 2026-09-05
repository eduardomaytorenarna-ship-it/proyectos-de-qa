#!/usr/bin/env bash
# Reproduce los hallazgos de la API. Requiere la API corriendo en :3000
#   cd ../proyectos-de-programacion/api-gestor-tareas && npm start
set -u
API="${API:-http://localhost:3000}"
SUFIJO=$(date +%s)

echo "== Preparacion: usuario de prueba =="
TOKEN=$(curl -sS -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"repro$SUFIJO@test.com\",\"password\":\"secret123\"}" \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")

echo
echo "== BUG-001: el email distingue mayusculas, se crean cuentas duplicadas =="
curl -sS -o /dev/null -w "  registro con 'Repro$SUFIJO@test.com' -> HTTP %{http_code}  (esperado 409, real 201)\n" \
  -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"Repro$SUFIJO@test.com\",\"password\":\"secret123\"}"
curl -sS -o /dev/null -w "  login con 'REPRO$SUFIJO@test.com' -> HTTP %{http_code}  (esperado 200, real 401)\n" \
  -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"REPRO$SUFIJO@test.com\",\"password\":\"secret123\"}"

echo
echo "== BUG-002: sin limite de intentos de login =="
for i in $(seq 1 30); do
  CODE=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$API/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"repro$SUFIJO@test.com\",\"password\":\"malo-$i\"}")
done
echo "  30 intentos fallidos consecutivos -> ultimo HTTP $CODE  (esperado 429, real 401)"

echo
echo "== BUG-003: sin longitud maxima en el titulo =="
LARGO=$(python3 -c "print('A'*5000)")
curl -sS -o /dev/null -w "  titulo de 5000 caracteres -> HTTP %{http_code}  (esperado 400, real 201)\n" \
  -X POST "$API/tasks" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"$LARGO\"}"

echo
echo "== BUG-004: acepta un titulo formado solo por espacios =="
curl -sS -X POST "$API/tasks" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"     "}' | python3 -c "
import json,sys
t=json.load(sys.stdin)
print(f'  tarea creada con titulo {t[\"title\"]!r} -> esperado HTTP 400')"

echo
echo "== BUG-005: politica de contrasena debil =="
curl -sS -o /dev/null -w "  password '123456' -> HTTP %{http_code}  (esperado 400, real 201)\n" \
  -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"debil$SUFIJO@test.com\",\"password\":\"123456\"}"

echo
echo "== BUG-006: 'done' entra como booleano y sale como entero =="
ID=$(curl -sS "$API/tasks" -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys;print(json.load(sys.stdin)[0]['id'])")
curl -sS -X PATCH "$API/tasks/$ID" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"done":true}' | python3 -c "
import json,sys
t=json.load(sys.stdin)
print(f'  se envio done=true (bool), la API devolvio done={t[\"done\"]!r} ({type(t[\"done\"]).__name__})')"
