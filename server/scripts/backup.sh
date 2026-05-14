#!/bin/bash

# FinCredit Database Backup Script
# Automated backup for SQLite databases

set -e

# Configuration
DB_PATH="${DB_PATH:-./prisma/dev.db}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/fincredit-backup-${TIMESTAMP}.db"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    error "Database file not found: $DB_PATH"
    exit 1
fi

# Get database size before backup
DB_SIZE=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH" 2>/dev/null || echo "unknown")
log "Database size: $DB_SIZE bytes"

# Create backup
log "Creating backup: $BACKUP_FILE"
if command -v sqlite3 &> /dev/null; then
    # Use sqlite3 backup command if available
    sqlite3 "$DB_PATH" ".backup $BACKUP_FILE"
else
    # Fallback to cp
    warn "sqlite3 command not found, using cp for backup"
    cp "$DB_PATH" "$BACKUP_FILE"
fi

# Verify backup was created
if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup failed: $BACKUP_FILE not created"
    exit 1
fi

# Get backup size
BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "unknown")
log "Backup created: $BACKUP_FILE (${BACKUP_SIZE} bytes)"

# Compress backup
log "Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Get compressed size
COMPRESSED_SIZE=$(stat -f%z "$BACKUP_FILE_GZ" 2>/dev/null || stat -c%s "$BACKUP_FILE_GZ" 2>/dev/null || echo "unknown")
log "Backup compressed: $BACKUP_FILE_GZ (${COMPRESSED_SIZE} bytes)"

# Clean old backups
log "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "fincredit-backup-*.db.gz" -type f -mtime +$RETENTION_DAYS -delete

# Create backup manifest
MANIFEST_FILE="${BACKUP_DIR}/backup-manifest-${TIMESTAMP}.json"
cat > "$MANIFEST_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "database_path": "$DB_PATH",
  "backup_file": "$BACKUP_FILE_GZ",
  "database_size": $DB_SIZE,
  "backup_size": $COMPRESSED_SIZE,
  "compression_ratio": "$(echo "scale=2; $COMPRESSED_SIZE * 100 / $DB_SIZE" | bc 2>/dev/null || echo "unknown")",
  "retention_days": $RETENTION_DAYS
}
EOF

log "Backup manifest created: $MANIFEST_FILE"

# Sync to cloud storage if configured (optional)
if [ -n "$CLOUD_SYNC_COMMAND" ]; then
    log "Syncing to cloud storage..."
    eval "$CLOUD_SYNC_COMMAND $BACKUP_FILE_GZ"
    eval "$CLOUD_SYNC_COMMAND $MANIFEST_FILE"
fi

# Send notification if configured (optional)
if [ -n "$NOTIFICATION_WEBHOOK" ]; then
    curl -X POST "$NOTIFICATION_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"FinCredit backup completed: $BACKUP_FILE_GZ\"}" \
        2>/dev/null || warn "Failed to send notification"
fi

log "Backup process completed successfully!"

# Display summary
echo
echo "=== Backup Summary ==="
echo "Database: $DB_PATH"
echo "Backup: $BACKUP_FILE_GZ"
echo "Size: $COMPRESSED_SIZE bytes"
echo "Timestamp: $(date)"
echo "Retention: $RETENTION_DAYS days"
echo "===================="
