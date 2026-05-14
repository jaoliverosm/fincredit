FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci && npm cache clean --force

COPY server/prisma ./prisma/
RUN npx prisma generate

COPY server/src/ ./src/
COPY server/entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3001
ENV NODE_ENV=production PORT=3001

CMD ["./entrypoint.sh"]
