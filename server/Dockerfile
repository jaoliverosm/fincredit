# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy server package files (Render context is repo root)
COPY server/package*.json ./
RUN npm ci

# Generate Prisma client
COPY server/prisma ./prisma/
RUN npx prisma generate

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy generated Prisma client + schema + Prisma CLI for migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma/

# Copy source code
COPY server/src/ ./src/

# Copy entrypoint script
COPY server/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fincredit -u 1001 && \
    chown -R fincredit:nodejs /app
USER fincredit

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["./entrypoint.sh"]
