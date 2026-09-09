#!/usr/bin/env bash
# Verifica que los 8 hallazgos del reporte sigan corregidos.
#
# Nacio como script de reproduccion, cuando los defectos existian. Al
# corregirse quedo obsoleto: seguia afirmando el comportamiento roto. En vez de
# borrarlo se invirtio, y ahora afirma el comportamiento correcto: si algun bug
# reaparece, este script falla.
#
# Requiere la API corriendo:
#   cd ../proyectos-de-programacion/api-gestor-tareas && npm start
set -u
API="${API:-http://localhost:3000}"
SUFIJO="$(date +%s)$RANDOM"
FALLOS=0

comprobar () { # <descripcion> <esperado> <obtenido>
  if [ "$2" = "$3" ]; then
    printf '  \033[32mOK\033[0m    %-58s %s\n' "$1" "$3"
  else
    printf '  \033[31mFALLA\033[0m %-58s esperado %s, obtenido %s\n' "$1" "$2" "$3"
    FALLOS=$((FALLOS + 1))
  fi
}

codigo () { curl -sS -o /dev/null -w '%{http_code}' "$@"; }

echo
echo "Verificacion de correcciones - API en $API"
echo

if [ "$(codigo "$API/health")" != "200" ]; then
  echo "  La API no responde en $API. Levantala antes de correr esto." >&2
  exit 2
fi

EMAIL="verif$SUFIJO@test.com"
TOKEN=$(curl -sS -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"melon-verde-42\"}" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin).get("token",""))')
[ -n "$TOKEN" ] || { echo "  No se pudo registrar el usuario de prueba." >&2; exit 2; }
AUTH="Authorization: Bearer $TOKEN"
JSON='Content-Type: application/json'

echo "BUG-001  el email no distingue mayusculas"
comprobar "registro con el email en mayusculas es duplicado" 409 \
  "$(codigo -X POST "$API/auth/register" -H "$JSON" -d "{\"email\":\"$(echo "$EMAIL" | tr 'a-z' 'A-Z')\",\"password\":\"melon-verde-42\"}")"
comprobar "login con el email en mayusculas funciona" 200 \
  "$(codigo -X POST "$API/auth/login" -H "$JSON" -d "{\"email\":\"$(echo "$EMAIL" | tr 'a-z' 'A-Z')\",\"password\":\"melon-verde-42\"}")"

echo "BUG-002  el login limita los intentos fallidos"
BLOQUEO=$(curl -sS -X POST "$API/auth/register" -H "$JSON" \
  -d "{\"email\":\"bruta$SUFIJO@test.com\",\"password\":\"melon-verde-42\"}" >/dev/null
  for _ in $(seq 1 6); do
    ULT=$(codigo -X POST "$API/auth/login" -H "$JSON" \
      -d "{\"email\":\"bruta$SUFIJO@test.com\",\"password\":\"incorrecta-larga\"}")
  done; echo "$ULT")
comprobar "el sexto intento fallido queda bloqueado" 429 "$BLOQUEO"

echo "BUG-003  el titulo tiene longitud maxima"
LARGO=$(python3 -c "print('A'*201)")
comprobar "titulo de 201 caracteres se rechaza" 400 \
  "$(codigo -X POST "$API/tasks" -H "$JSON" -H "$AUTH" -d "{\"title\":\"$LARGO\"}")"

echo "BUG-004  el titulo se recorta y no admite solo espacios"
comprobar "titulo de puros espacios se rechaza" 400 \
  "$(codigo -X POST "$API/tasks" -H "$JSON" -H "$AUTH" -d '{"title":"     "}')"
TITULO=$(curl -sS -X POST "$API/tasks" -H "$JSON" -H "$AUTH" -d '{"title":"   Con espacios   "}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin).get("title"))')
comprobar "los espacios alrededor se recortan" "Con espacios" "$TITULO"

echo "BUG-005  la politica de contrasenas rechaza las debiles"
comprobar "contrasena '123456' se rechaza" 400 \
  "$(codigo -X POST "$API/auth/register" -H "$JSON" -d "{\"email\":\"debil$SUFIJO@test.com\",\"password\":\"123456\"}")"
comprobar "contrasena de 7 caracteres se rechaza" 400 \
  "$(codigo -X POST "$API/auth/register" -H "$JSON" -d "{\"email\":\"corta$SUFIJO@test.com\",\"password\":\"siete77\"}")"

echo "BUG-006  done es booleano en la entrada y en la salida"
TIPO=$(curl -sS -X POST "$API/tasks" -H "$JSON" -H "$AUTH" -d '{"title":"Tipo de done"}' \
  | python3 -c 'import json,sys; print(type(json.load(sys.stdin)["done"]).__name__)')
comprobar "el campo done llega como booleano" "bool" "$TIPO"

echo "BUG-007  GET /tasks pagina y reporta el total"
FORMA=$(curl -sS "$API/tasks?limit=2" -H "$AUTH" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(",".join(sorted(d)))')
comprobar "la respuesta trae la forma paginada" "limit,offset,tasks,total" "$FORMA"
comprobar "un limit fuera de rango se rechaza" 400 "$(codigo "$API/tasks?limit=9999" -H "$AUTH")"

echo
if [ "$FALLOS" -eq 0 ]; then
  echo "  Todos los hallazgos siguen corregidos."
  exit 0
fi
echo "  $FALLOS comprobacion(es) fallida(s): algun defecto reaparecio."
exit 1
