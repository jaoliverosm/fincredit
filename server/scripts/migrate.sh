#!/bin/bash

# FinCredit Database Migration Script
# Automated database migrations for production and development

set -e

# Configuration
ENVIRONMENT="${ENVIRONMENT:-development}"
NODE_ENV="${NODE_ENV:-$ENVIRONMENT}"
DATABASE_URL="${DATABASE_URL:-file:./prisma/dev.db}"

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
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Run development migrations"
    echo "  deploy      Run deployment migrations"
    echo "  reset       Reset database (dangerous)"
    echo "  status      Show migration status"
    echo "  generate    Generate Prisma client"
    echo "  studio      Open Prisma Studio"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -e, --env      Set environment (default: development)"
    echo "  -f, --force    Force operation without confirmation"
    echo "  -v, --verbose  Verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 dev"
    echo "  $0 -e production deploy"
    echo "  $0 -f reset"
    exit 0
}

# Check prerequisites
check_prerequisites() {
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found"
        exit 1
    fi
    
    # Check if Prisma is installed
    if ! npm list @prisma/cli &> /dev/null; then
        warn "Prisma CLI not found, installing..."
        npm install -g @prisma/cli
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        info "Prerequisites check passed"
    fi
}

# Generate Prisma client
generate_client() {
    log "Generating Prisma client..."
    
    if [ "$VERBOSE" = "true" ]; then
        npx prisma generate --verbose
    else
        npx prisma generate
    fi
    
    log "Prisma client generated successfully"
}

# Run development migrations
migrate_dev() {
    log "Running development migrations..."
    
    # Create backup before migration
    if [ -f "prisma/dev.db" ]; then
        local backup_file="backups/pre-migrate-$(date +%Y%m%d-%H%M%S).db"
        mkdir -p backups
        cp prisma/dev.db "$backup_file"
        info "Pre-migration backup created: $backup_file"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        npx prisma migrate dev --verbose
    else
        npx prisma migrate dev
    fi
    
    log "Development migrations completed"
}

# Run deployment migrations
migrate_deploy() {
    log "Running deployment migrations..."
    
    # Check if we're in production
    if [ "$NODE_ENV" = "production" ]; then
        warn "Running migrations in production mode"
        
        # Create backup before migration
        if [ -f "prisma/dev.db" ]; then
            local backup_file="backups/pre-deploy-$(date +%Y%m%d-%H%M%S).db"
            mkdir -p backups
            cp prisma/dev.db "$backup_file"
            info "Pre-deployment backup created: $backup_file"
        fi
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        npx prisma migrate deploy --verbose
    else
        npx prisma migrate deploy
    fi
    
    log "Deployment migrations completed"
}

# Reset database
reset_database() {
    warn "This will DELETE ALL data in the database"
    
    if [ "$FORCE" != "true" ]; then
        echo
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Database reset cancelled by user"
            exit 0
        fi
    fi
    
    log "Resetting database..."
    
    if [ "$VERBOSE" = "true" ]; then
        npx prisma migrate reset --force --verbose
    else
        npx prisma migrate reset --force
    fi
    
    log "Database reset completed"
}

# Show migration status
show_status() {
    log "Checking migration status..."
    
    # Check if database exists
    if [ ! -f "prisma/dev.db" ]; then
        warn "Database file not found"
        return 1
    fi
    
    # Show database info
    if command -v sqlite3 &> /dev/null; then
        local table_count=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
        local db_size=$(stat -f%z prisma/dev.db 2>/dev/null || stat -c%s prisma/dev.db 2>/dev/null || echo "unknown")
        
        echo "Database Status:"
        echo "  File: prisma/dev.db"
        echo "  Size: $db_size bytes"
        echo "  Tables: $table_count"
        echo "  Environment: $NODE_ENV"
    else
        warn "sqlite3 not available, limited status information"
    fi
}

# Open Prisma Studio
open_studio() {
    log "Opening Prisma Studio..."
    npx prisma studio
}

# Parse command line arguments
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            NODE_ENV="$2"
            shift 2
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
            COMMAND="$1"
            shift
            ;;
    esac
done

# Set default command if none provided
COMMAND="${COMMAND:-dev}"

# Main execution
main() {
    log "FinCredit Migration Script"
    log "Environment: $ENVIRONMENT"
    log "Command: $COMMAND"
    
    # Set environment variables
    export NODE_ENV="$NODE_ENV"
    export DATABASE_URL="$DATABASE_URL"
    
    if [ "$VERBOSE" = "true" ]; then
        info "Environment variables set:"
        info "  NODE_ENV: $NODE_ENV"
        info "  DATABASE_URL: $DATABASE_URL"
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Generate client first
    generate_client
    
    # Execute command
    case $COMMAND in
        dev)
            migrate_dev
            ;;
        deploy)
            migrate_deploy
            ;;
        reset)
            reset_database
            ;;
        status)
            show_status
            ;;
        generate)
            log "Client already generated"
            ;;
        studio)
            open_studio
            ;;
        *)
            error "Unknown command: $COMMAND"
            usage
            ;;
    esac
    
    log "Migration script completed successfully!"
}

# Run main function
main
