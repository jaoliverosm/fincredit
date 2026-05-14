#!/bin/bash

# FinCredit Database Restore Script
# Automated restore for SQLite databases

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_PATH="${DB_PATH:-./prisma/dev.db}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS] <backup_file>"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List available backups"
    echo "  -f, --force    Force restore without confirmation"
    echo "  -v, --verbose  Verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 --list"
    echo "  $0 backups/fincredit-backup-20240101-120000.db.gz"
    echo "  $0 -f backups/fincredit-backup-20240101-120000.db.gz"
    exit 0
}

# List available backups
list_backups() {
    log "Available backups in $BACKUP_DIR:"
    echo
    
    if [ ! -d "$BACKUP_DIR" ]; then
        warn "Backup directory not found: $BACKUP_DIR"
        return 1
    fi
    
    local backups=($(find "$BACKUP_DIR" -name "fincredit-backup-*.db.gz" -type f | sort -r))
    
    if [ ${#backups[@]} -eq 0 ]; then
        warn "No backups found"
        return 1
    fi
    
    printf "%-40s %-15s %-15s\n" "BACKUP FILE" "SIZE" "DATE"
    printf "%-40s %-15s %-15s\n" "------------" "----" "----"
    
    for backup in "${backups[@]}"; do
        local filename=$(basename "$backup")
        local size=$(stat -f%z "$backup" 2>/dev/null || stat -c%s "$backup" 2>/dev/null || echo "unknown")
        local date=$(stat -f%Sm "$backup" 2>/dev/null || stat -c%y "$backup" 2>/dev/null || echo "unknown")
        printf "%-40s %-15s %-15s\n" "$filename" "$size" "$date"
    done
    
    echo
    return 0
}

# Confirm restore
confirm_restore() {
    local backup_file="$1"
    local force="$2"
    
    if [ "$force" = "true" ]; then
        return 0
    fi
    
    echo
    warn "This will REPLACE the current database at: $DB_PATH"
    warn "with the backup: $backup_file"
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
}

# Restore database
restore_database() {
    local backup_file="$1"
    local force="$2"
    local verbose="$3"
    
    # Check if backup file exists
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Create backup directory if it doesn't exist
    mkdir -p "$(dirname "$DB_PATH")"
    
    # Create pre-restore backup if database exists
    if [ -f "$DB_PATH" ]; then
        local pre_restore_backup="${BACKUP_DIR}/pre-restore-$(date +%Y%m%d-%H%M%S).db"
        log "Creating pre-restore backup: $pre_restore_backup"
        cp "$DB_PATH" "$pre_restore_backup"
        
        if [ "$verbose" = "true" ]; then
            info "Pre-restore backup created: $pre_restore_backup"
        fi
    fi
    
    # Decompress backup if needed
    local temp_backup="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        temp_backup="${backup_file%.gz}"
        log "Decompressing backup..."
        gunzip -c "$backup_file" > "$temp_backup"
        
        if [ "$verbose" = "true" ]; then
            info "Decompressed to: $temp_backup"
        fi
    fi
    
    # Verify backup integrity
    if [ "$verbose" = "true" ]; then
        info "Verifying backup integrity..."
        if command -v sqlite3 &> /dev/null; then
            sqlite3 "$temp_backup" "PRAGMA integrity_check;" || {
                error "Backup integrity check failed"
                exit 1
            }
            info "Backup integrity check passed"
        else
            warn "sqlite3 not available, skipping integrity check"
        fi
    fi
    
    # Restore database
    log "Restoring database from: $temp_backup"
    cp "$temp_backup" "$DB_PATH"
    
    # Set proper permissions
    chmod 644 "$DB_PATH"
    
    # Clean up temporary file
    if [ "$temp_backup" != "$backup_file" ]; then
        rm -f "$temp_backup"
    fi
    
    # Verify restore
    if [ "$verbose" = "true" ]; then
        info "Verifying restored database..."
        if command -v sqlite3 &> /dev/null; then
            local result=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master;" 2>/dev/null || echo "0")
            info "Database tables: $result"
        fi
    fi
    
    log "Database restored successfully!"
}

# Parse command line arguments
FORCE=false
VERBOSE=false
LIST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -l|--list)
            LIST_ONLY=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -*)
            error "Unknown option: $1"
            usage
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

# Main execution
main() {
    if [ "$LIST_ONLY" = "true" ]; then
        list_backups
        exit $?
    fi
    
    if [ -z "$BACKUP_FILE" ]; then
        error "No backup file specified"
        usage
    fi
    
    # Convert relative path to absolute if needed
    if [[ "$BACKUP_FILE" != /* ]]; then
        BACKUP_FILE="$(pwd)/$BACKUP_FILE"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        info "Backup file: $BACKUP_FILE"
        info "Database path: $DB_PATH"
        info "Force restore: $FORCE"
    fi
    
    confirm_restore "$BACKUP_FILE" "$FORCE"
    restore_database "$BACKUP_FILE" "$FORCE" "$VERBOSE"
    
    # Display summary
    echo
    echo "=== Restore Summary ==="
    echo "Backup: $BACKUP_FILE"
    echo "Database: $DB_PATH"
    echo "Timestamp: $(date)"
    echo "===================="
}

# Run main function
main
