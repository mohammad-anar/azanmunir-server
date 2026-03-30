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
ENV DATABASE_URL="postgresql://postgres:123456@localhost:5432/azanmunir?schema=public"
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

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy all node_modules from builder and prune devDependencies
COPY --from=builder /app/node_modules ./node_modules
RUN pnpm prune --prod

# Create uploads and tmp directories
RUN mkdir -p uploads tmp

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the app port (default 4000)
EXPOSE 4000

# Start the application
CMD ["sh", "-c", "pnpm exec prisma migrate deploy --config prisma.config.js && node dist/server.js"]
