# Starter Web: Angular + Rspack & Hono.js Backend

A full-stack web application starter featuring a modern **Angular 19** frontend with **Rspack** bundler and a **Hono.js** backend with **Drizzle ORM** and **SQLite**.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Database Management](#database-management)
- [Code Quality](#code-quality)
- [Build & Deploy](#build--deploy)

## Overview

This monorepo provides a complete full-stack development environment:

| Package | Description |
|---------|-------------|
| `frontend/` | Angular 19 SPA with Rspack bundler and Bun runtime |
| `backend/` | REST API with Hono.js, Drizzle ORM, SQLite on Bun |

### Key Features

- ⚡ **Fast Development** - Rspack + Bun for rapid builds and hot reload
- 🏗️ **Clean Architecture** - DI pattern with Controllers → Services → Repositories
- 📦 **Type-Safe** - Full TypeScript support across frontend and backend
- 🗄️ **SQLite Database** - Lightweight database with Drizzle ORM migrations
- 🎨 **Code Quality** - Biome for fast linting and formatting

## Project Structure

```
starter-web-angular-rspack/
├── frontend/                 # Angular 19 + Rspack
│   ├── src/                  # Application source code
│   ├── rspack.config.js      # Rspack bundler configuration
│   ├── angular.json          # Angular CLI configuration
│   ├── biome.json            # Biome linter/formatter config
│   └── package.json
├── backend/                  # Hono.js + Drizzle + Bun
│   ├── src/
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # Route definitions
│   │   ├── db/               # Database schema & config
│   │   ├── container/        # Dependency Injection
│   │   └── types/            # TypeScript types
│   ├── drizzle/              # Database migrations
│   ├── drizzle.config.ts     # Drizzle configuration
│   └── package.json
└── README.md
```

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 19.2 | UI Framework |
| Rspack | 1.3.5 | Fast Rust-based bundler |
| Bun | 1.3 | Fast JavaScript runtime |
| Biome | 2.4.2 | Linter & formatter |
| RxJS | 7.8 | Reactive programming |
| Sass | 1.97 | CSS preprocessor |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Hono.js | Latest | Lightweight web framework |
| Drizzle ORM | Latest | Type-safe ORM |
| SQLite | - | Embedded database |
| Bun | Latest | Runtime & package manager |
| TypeScript | - | Type safety |

## Prerequisites

- **Bun** v1.3+ (recommended) or Node.js v18+
- Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd starter-web-angular-rspack
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
bun install

# Install backend dependencies
cd ../backend
bun install
```

### 3. Setup Database

```bash
cd backend

# Generate initial migrations
bun run db:generate

# Apply migrations
bun run db:migrate
```

### 4. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
bun run dev
```

Backend runs on `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd frontend
bun run dev
```

Frontend runs on `http://localhost:4200`

## Development

### Frontend Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Rspack dev server with HMR |
| `bun run serve:rspack` | Start Rspack dev server |
| `bun run start` | Start Angular CLI dev server (webpack) |
| `bun run build:rspack` | Production build with Rspack |
| `bun run build` | Production build with Angular CLI |
| `bun run test` | Run unit tests with Karma |
| `bun run lint` | Check code with Biome |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run format` | Check formatting |
| `bun run format:fix` | Auto-fix formatting |

### Backend Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run start` | Start production server |
| `bun run db:generate` | Generate migrations after schema changes |
| `bun run db:migrate` | Apply migrations to database |
| `bun run db:studio` | Open Drizzle Studio (database GUI) |

## API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Example Requests

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

## Database Management

### Schema Location

Database schema is defined in `backend/src/db/schema.ts`.

### Migrations Workflow

1. Modify the schema in `backend/src/db/schema.ts`
2. Generate migration: `bun run db:generate`
3. Apply migration: `bun run db:migrate`

### Database GUI

Open Drizzle Studio to browse and edit data:

```bash
cd backend
bun run db:studio
```

## Code Quality

### Linting & Formatting

This project uses **Biome** (faster alternative to ESLint + Prettier).

```bash
# Frontend
cd frontend
bun run lint
bun run lint:fix
bun run format
bun run format:fix

# Backend (configure Biome similarly if needed)
```

### Architecture Guidelines

Backend follows a clean architecture pattern:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│ Controllers │ ──► │   Services   │ ──► │  Repositories   │ ──► │ Database │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────┘
       ▲                   ▲                    ▲
       └───────────────────┴────────────────────┘
                    DI Container
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and orchestration
- **Repositories**: Data access and queries
- **Container**: Dependency injection management

## Build & Deploy

### Production Build

```bash
# Build frontend
cd frontend
bun run build:rspack
# Output: dist/

# Build backend
cd ../backend
# No build step needed (Bun runs TypeScript directly)
```

### Deployment Considerations

1. **Frontend**: Deploy `frontend/dist/` contents to a static hosting or CDN
2. **Backend**: Deploy the entire `backend/` folder to a server that supports Bun
3. **Database**: Copy `sqlite.db` or configure production database path
4. **Environment**: Set appropriate environment variables for production

### Environment Variables

Configure as needed in your deployment environment:

- Backend server port (default: 3000)
- Database path
- CORS settings for frontend-backend communication

---

## License

This project is provided as-is for educational and starter purposes.
