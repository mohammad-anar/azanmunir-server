# Azan Munir Server

Backend API server for a comprehensive workshop, bike servicing, and booking platform. Built with a modular, domain-driven architecture using modern Node.js technologies.

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (with [PostGIS](https://postgis.net/) for spatial data)
- **Caching & Pub/Sub:** [Redis](https://redis.io/)
- **Real-time Communication:** [Socket.io](https://socket.io/)
- **Validation:** [Zod](https://zod.dev/)
- **Authentication:** JWT (JSON Web Tokens)
- **Package Manager:** `pnpm`

## 📁 Project Structure

The project follows a localized, modular, and domain-driven folder architecture:

```text
src/
├── app.ts                  # Express application setup, global middlewares
├── server.ts               # App entry point, DB/socket initialization, shutdown handling
├── app/
│   ├── modules/            # Domain-specific modules (auth, bike, booking, job, etc.)
│   ├── routes/             # Centralized router aggregating all module routes
│   ├── middlewares/        # Global middlewares (error handler, not found)
│   └── shared/             # Reusable utilities (catchAsync, sendResponse, etc.)
├── config/                 # Environment variable configurations
├── helpers/                # Helper utilities
└── types/                  # Global type declarations
```

Each module under `src/app/modules/` is self-contained with its own controllers, routes, services, interfaces, and validations, following the `[moduleName].[type].ts` naming convention.

## 🛠️ Prerequisites

- **Node.js** (v18 or higher recommended)
- **pnpm** (Package manager)
- **PostgreSQL** (with PostGIS extension installed)
- **Redis** server running locally or remotely

## ⚙️ Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   Copy the example environment file and configure your variables:
   ```bash
   cp .example.env .env
   ```
   *Make sure to update `.env` with your actual Database URL, Redis URL, JWT secrets, etc.*

3. **Database Setup:**
   Generate the Prisma Client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 💻 Available Scripts

- `pnpm dev`: Start the development server with hot-reloading.
- `pnpm build`: Compile TypeScript source code into the `dist` directory.
- `pnpm start`: Start the server via `tsx`.
- `pnpm start:prod`: Start the compiled production server from the `dist` folder.

## 📝 Development Guidelines

Please refer to the [instructions.md](./instructions.md) file for detailed backend instructions, architectural patterns, naming conventions, and steps for creating new modules.
