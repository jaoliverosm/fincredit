FROM node:18-alpine

WORKDIR /app

# Copy package files from repo root context
COPY server/package*.json ./

# Install all dependencies (including dev for Prisma generation)
RUN npm ci && npm cache clean --force

# Copy Prisma schema and generate client
COPY server/prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY server/src/ ./src/
COPY server/entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["./entrypoint.sh"]
