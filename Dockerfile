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

# Provide placeholder database URLs for schema validation during generation
ENV DATABASE_URL=postgresql://postgres.uqepwcyseokcuhshfolw:AzanMunir123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
ENV DIRECT_URL=postgresql://postgres.uqepwcyseokcuhshfolw:AzanMunir123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

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

# Add environment variables for prisma generation (required by your prisma.config.js)
ENV DATABASE_URL=postgresql://postgres.uqepwcyseokcuhshfolw:AzanMunir123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
ENV DIRECT_URL=postgresql://postgres.uqepwcyseokcuhshfolw:AzanMunir123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

# Generate Prisma client for the production environment
RUN pnpm exec prisma generate --config prisma.config.js

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Create uploads and tmp directories
RUN mkdir -p uploads tmp

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the app port (default 5000)
EXPOSE 5000

# Run Prisma migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma.config.js && node dist/server.js"]