#!/bin/bash
# ==============================================================================
# QAAGA Super Marketplace — PostgreSQL Production Backup Script
# Usage: ./scripts/db-backup.sh [output_path]
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/qaaga_backup_${TIMESTAMP}.dump"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[ERROR] DATABASE_URL environment variable is not set." >&2
  exit 1
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting QAAGA PostgreSQL database backup..."

# Execute pg_dump using custom compressed format (suitable for pg_restore)
pg_dump "$DATABASE_URL" \
  --format=custom \
  --blobs \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup completed successfully: $BACKUP_FILE (Size: $FILESIZE)"

# Retention policy: Remove local dumps older than 30 days
find "$BACKUP_DIR" -name "qaaga_backup_*.dump" -mtime +30 -delete 2>/dev/null || true
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Retention cleanup applied (30-day retention)."
