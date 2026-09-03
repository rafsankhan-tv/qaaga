#!/bin/bash
# ==============================================================================
# QAAGA Super Marketplace — PostgreSQL Production Restore Script
# Usage: ./scripts/db-restore.sh <backup_file.dump> [target_database_url]
# ==============================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"
TARGET_DB="${2:-${TARGET_DATABASE_URL:-${TEST_DATABASE_URL:-}}}"

if [ -z "$BACKUP_FILE" ]; then
  echo "[ERROR] Backup file path must be provided as the first argument." >&2
  echo "Usage: $0 <path_to_backup.dump> [target_database_url]" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[ERROR] Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [ -z "$TARGET_DB" ]; then
  echo "[ERROR] TARGET_DATABASE_URL or TEST_DATABASE_URL is not set." >&2
  echo "Refusing to restore without an explicit target database." >&2
  exit 1
fi

# Guard against accidental production overwrite
if [ "$TARGET_DB" = "${DATABASE_URL:-}" ] && [ "${FORCE_PRODUCTION_RESTORE:-}" != "CONFIRM_RESTORE" ]; then
  echo "[CRITICAL SAFETY GUARD] Target URL matches DATABASE_URL (production)!" >&2
  echo "To proceed with production disaster recovery, set: FORCE_PRODUCTION_RESTORE=CONFIRM_RESTORE" >&2
  exit 1
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting restore from $BACKUP_FILE..."

# Execute pg_restore with clean, single-transaction mode
pg_restore \
  --dbname="$TARGET_DB" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --single-transaction \
  "$BACKUP_FILE"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Database restoration completed successfully."
