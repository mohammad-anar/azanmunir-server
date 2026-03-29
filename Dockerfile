# =====================
# Stage 1: Builder
# =====================
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma.config.js prisma.config.ts ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src

# Generate Prisma client
RUN pnpm exec prisma generate --config prisma.config.js

# Build TypeScript
RUN pnpm run build

# =====================
# Stage 2: Production
# =====================
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma.config.js prisma.config.ts ./
COPY prisma ./prisma

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create uploads and tmp directories
RUN mkdir -p uploads tmp

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the app port (default 5000)
EXPOSE 5000

# Run Prisma migrations then start the app
CMD ["sh", "-c", "node -e \"require('dotenv/config')\" || true && npx prisma migrate deploy --config prisma.config.js 2>/dev/null || true && node dist/server.js"]
