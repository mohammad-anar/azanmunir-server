# =====================
# Stage 1: Builder
# =====================
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy configuration and dependency files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY tsconfig.json ./

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
RUN pnpm exec prisma generate

# Build TypeScript to verify code correctness
RUN pnpm run build

# =====================
# Stage 2: Runner
# =====================
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files from builder
# We copy src and tsconfig because we'll use tsx to run the server.
# This ensures that path aliases and ESM/CJS interop (e.g. PrismaClient)
# work exactly like they do in the development environment.
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma.config.js ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./

# Install ONLY production dependencies + tsx
RUN pnpm install --prod --frozen-lockfile && pnpm add -D tsx

# Create necessary directories
RUN mkdir -p uploads tmp

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start command
# We run migrations and then start the server using tsx.
# This handles the absolute-looking path aliases and the Prisma ESM/CJS named exports natively.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec tsx ./src/server.ts"]
