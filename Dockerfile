# Use a slim Node image
FROM node:20-slim

# Install OpenSSL (required for Prisma to run in Docker)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
# Update this line if your schema file has an extension like .prisma
RUN npx prisma generate --schema ./prisma/schema 

# Copy the rest of your source code
COPY . .

EXPOSE 3000

# Start the application using tsx pointing to your server.ts
CMD ["npx", "tsx", "src/server.ts"]