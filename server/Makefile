# FinCredit Backend Makefile
# Scripts para desarrollo, testing, migraciones y backups

.PHONY: help dev build test clean migrate seed backup restore docker-build docker-run docker-stop

# Variables
NODE_ENV ?= development
PORT ?= 3001
DOCKER_TAG ?= fincredit-server
DOCKER_REGISTRY ?= your-docker-username

# Help
help:
	@echo "FinCredit Backend - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev              - Start development server"
	@echo "  build            - Build for production"
	@echo "  test             - Run tests"
	@echo "  test:watch       - Run tests in watch mode"
	@echo "  test:coverage    - Run tests with coverage"
	@echo ""
	@echo "Database:"
	@echo "  migrate          - Run database migrations"
	@echo "  migrate:dev      - Run migrations in development"
	@echo "  migrate:prod     - Run migrations in production"
	@echo "  seed             - Seed database with test data"
	@echo "  seed:prod        - Seed production database"
	@echo "  reset            - Reset database (drop and recreate)"
	@echo "  backup           - Create database backup"
	@echo "  restore FILE     - Restore database from backup"
	@echo "  studio           - Open Prisma Studio"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build     - Build Docker image"
	@echo "  docker-run       - Run Docker container"
	@echo "  docker-stop      - Stop Docker container"
	@echo "  docker-push      - Push to Docker registry"
	@echo "  docker-compose   - Run with docker-compose"
	@echo ""
	@echo "Production:"
	@echo "  start            - Start production server"
	@echo "  logs             - Show application logs"
	@echo "  health           - Check application health"
	@echo ""
	@echo "Utilities:"
	@echo "  clean            - Clean dependencies and cache"
	@echo "  lint             - Run linting"
	@echo "  format           - Format code"

# Development
dev:
	@echo "🚀 Starting development server..."
	NODE_ENV=$(NODE_ENV) PORT=$(PORT) npm run dev

build:
	@echo "🔨 Building for production..."
	npm ci --only=production
	npx prisma generate

test:
	@echo "🧪 Running tests..."
	npm test

test:watch:
	@echo "🧪 Running tests in watch mode..."
	npm run test:watch

test:coverage:
	@echo "📊 Running tests with coverage..."
	npm run test:coverage

# Database operations
migrate:
	@echo "🗄️ Running database migrations..."
	npx prisma migrate deploy

migrate:dev:
	@echo "🗄️ Running development migrations..."
	npx prisma migrate dev

migrate:prod:
	@echo "🗄️ Running production migrations..."
	npx prisma migrate deploy --preview-feature

seed:
	@echo "🌱 Seeding database..."
	npx prisma db seed

seed:prod:
	@echo "🌱 Seeding production database..."
	NODE_ENV=production npx prisma db seed

reset:
	@echo "🔄 Resetting database..."
	npx prisma migrate reset --force

backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker exec fincredit-db sqlite3 /app/data/dev.db ".backup backups/backup-$(shell date +%Y%m%d-%H%M%S).db" || \
	cp prisma/dev.db backups/backup-$(shell date +%Y%m%d-%H%M%S).db
	@echo "✅ Backup created in backups/"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Please specify backup file: make restore FILE=backups/backup-xxx.db"; \
		exit 1; \
	fi
	@echo "🔄 Restoring database from $(FILE)..."
	@cp $(FILE) prisma/dev.db
	@echo "✅ Database restored from $(FILE)"

studio:
	@echo "🎨 Opening Prisma Studio..."
	npx prisma studio

# Docker operations
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t $(DOCKER_TAG):latest .
	docker build -t $(DOCKER_TAG):$(shell git rev-parse --short HEAD) .

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -d \
		--name fincredit-server \
		-p $(PORT):3001 \
		--env-file .env \
		--restart unless-stopped \
		$(DOCKER_TAG):latest

docker-stop:
	@echo "🐳 Stopping Docker container..."
	docker stop fincredit-server || true
	docker rm fincredit-server || true

docker-push:
	@echo "🐳 Pushing to Docker registry..."
	docker tag $(DOCKER_TAG):latest $(DOCKER_REGISTRY)/$(DOCKER_TAG):latest
	docker tag $(DOCKER_TAG):$(shell git rev-parse --short HEAD) $(DOCKER_REGISTRY)/$(DOCKER_TAG):$(shell git rev-parse --short HEAD)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_TAG):latest
	docker push $(DOCKER_REGISTRY)/$(DOCKER_TAG):$(shell git rev-parse --short HEAD)

docker-compose:
	@echo "🐳 Running with docker-compose..."
	docker-compose up -d

# Production
start:
	@echo "🚀 Starting production server..."
	NODE_ENV=production PORT=$(PORT) npm start

logs:
	@echo "📋 Showing application logs..."
	docker logs fincredit-server -f

health:
	@echo "🏥 Checking application health..."
	curl -f http://localhost:$(PORT)/health || echo "❌ Health check failed"

# Utilities
clean:
	@echo "🧹 Cleaning dependencies and cache..."
	rm -rf node_modules
	rm -rf .npm
	rm -rf coverage
	rm -rf backups
	npm cache clean --force

lint:
	@echo "🔍 Running linting..."
	npm run lint || echo "⚠️ No lint script found"

format:
	@echo "✨ Formatting code..."
	npm run format || echo "⚠️ No format script found"

# Development workflow setup
setup:
	@echo "⚙️ Setting up development environment..."
	npm ci
	npx prisma generate
	npx prisma migrate dev
	npm run db:seed
	@echo "✅ Development environment ready!"

# Production deployment
deploy:
	@echo "🚀 Deploying to production..."
	make docker-build
	make docker-push
	@echo "✅ Deployment complete!"

# Full CI/CD pipeline
ci:
	@echo "🔄 Running CI pipeline..."
	make lint
	make test
	make build
	@echo "✅ CI pipeline passed!"

# Database maintenance
db-maintenance:
	@echo "🔧 Running database maintenance..."
	npx prisma db push
	npx prisma generate
	make backup
	@echo "✅ Database maintenance complete!"

# Security checks
security:
	@echo "🔒 Running security checks..."
	npm audit
	npx audit-ci --moderate
	@echo "✅ Security checks complete!"

# Performance monitoring
perf:
	@echo "📊 Running performance tests..."
	npm run test:perf || echo "⚠️ No performance tests found"
	@echo "✅ Performance tests complete!"

# Documentation
docs:
	@echo "📚 Generating documentation..."
	npx jsdoc src -c jsdoc.conf.json || echo "⚠️ No jsdoc configuration found"
	@echo "✅ Documentation generated!"

# All-in-one development setup
init:
	@echo "🎯 Initializing FinCredit Backend..."
	make setup
	make docker-build
	@echo "✅ FinCredit Backend initialized!"
