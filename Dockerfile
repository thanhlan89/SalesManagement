FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source + prisma schema
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Runtime image
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh","-c","npx prisma migrate deploy && node dist/main.js"]
