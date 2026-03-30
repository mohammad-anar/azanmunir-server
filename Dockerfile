FROM node:20-slim

# 1. Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 2. Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# 3. Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --ignore-scripts

# 4. Copy your project files
COPY dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./ 

# We REMOVE the "RUN npx prisma generate" from here because 
# it crashes without the DATABASE_URL during build.

ENV PRISMA_CLIENT_ENGINE_TYPE="library"
EXPOSE 3000

# 1. Generate: Points to the FOLDER
# 2. Migrate: Applies existing migrations from prisma/migrations
# 3. Start: Runs the compiled JS
CMD ["sh", "-c", "npx prisma generate --schema ./prisma/schema && npx prisma migrate deploy --schema ./prisma/schema && npx tsx dist/server.js"]