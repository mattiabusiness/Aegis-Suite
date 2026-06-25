#!/usr/bin/env bash
# ============================================================================
# AEGIS SUITE — BACKUP MANUALE DATABASE (schema + dati)
# File: db/backup.sh
# ----------------------------------------------------------------------------
# Crea un dump completo (struttura + dati) del database Supabase in un file .sql
# ripristinabile. Da usare finché non si passa a Supabase Pro (backup automatici).
#
# USO:
#   1) Prendi la connection string:
#      Supabase → Project Settings → Database → Connection string → URI
#      (usa la connessione diretta, porta 5432; copia anche la password).
#   2) Esporta la variabile e lancia:
#        export AEGIS_DB_URL="postgresql://postgres.[REF]:[PWD]@[HOST]:5432/postgres"
#        bash db/backup.sh
#
#   Opzionale: scegli dove salvare il file
#        export AEGIS_BACKUP_DIR="/c/Users/matti/Downloads"
#
# RIPRISTINO (su un progetto vuoto):
#        psql "$AEGIS_DB_URL" -f aegis-backup-YYYYMMDD-HHMM.sql
#
# ⚠️ Il file contiene DATI PERSONALI dei clienti (PII):
#    conservalo al sicuro e NON committarlo su git (vedi db/.gitignore).
# ============================================================================

set -euo pipefail

# 1) Connection string obbligatoria
if [ -z "${AEGIS_DB_URL:-}" ]; then
  echo "❌ Variabile AEGIS_DB_URL non impostata."
  echo "   Esempio:"
  echo "   export AEGIS_DB_URL=\"postgresql://postgres.[REF]:[PWD]@[HOST]:5432/postgres\""
  exit 1
fi

# 2) Cartella di output (default: cartella corrente)
OUT_DIR="${AEGIS_BACKUP_DIR:-.}"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M)"
OUT_FILE="$OUT_DIR/aegis-backup-$STAMP.sql"

# 3) Dump — pg_dump se disponibile, altrimenti fallback alla Supabase CLI
if command -v pg_dump >/dev/null 2>&1; then
  echo "⏳ Backup (pg_dump) → $OUT_FILE"
  pg_dump "$AEGIS_DB_URL" --clean --if-exists --no-owner --no-privileges -f "$OUT_FILE"
elif command -v npx >/dev/null 2>&1; then
  echo "ℹ️  pg_dump non trovato: uso 'npx supabase db dump'."
  echo "⏳ Backup (supabase CLI) → $OUT_FILE"
  npx supabase db dump --db-url "$AEGIS_DB_URL" -f "$OUT_FILE"
else
  echo "❌ Né pg_dump né npx disponibili."
  echo "   Installa i PostgreSQL client tools (pg_dump) oppure Node/npx."
  exit 1
fi

echo "✅ Backup completato: $OUT_FILE"
echo "   Dimensione: $(du -h "$OUT_FILE" | cut -f1)"
echo "⚠️  Contiene dati personali: conservalo al sicuro, NON committarlo su git."
