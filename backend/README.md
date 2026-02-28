# Hono.js + Drizzle SQLite Starter

A minimal REST API starter built with **Hono.js**, **Drizzle ORM**, and **SQLite** on **Bun** with **Dependency Injection** architecture.

## Features

- 🚀 Fast setup with Bun runtime
- 🔥 Hot reload with `bun run --hot`
- 📦 Drizzle ORM for type-safe database operations
- 🗄️ SQLite database with migrations
- 🛣️ RESTful API routes example
- 💉 Dependency Injection pattern
- 🏗️ Clean architecture: Controllers → Services → Repositories

## Project Structure

```
backend/
├── src/
│   ├── container/          # Dependency Injection
│   │   ├── container.ts    # DI container implementation
│   │   └── di-container.ts # Service bindings and tokens
│   ├── controllers/        # HTTP request handlers
│   │   └── user-controller.ts
│   ├── services/           # Business logic layer
│   │   └── user-service.ts
│   ├── repositories/       # Data access layer
│   │   └── user-repository.ts
│   ├── routes/             # Route definitions
│   │   └── users.ts
│   ├── db/                 # Database configuration
│   │   ├── index.ts        # DB connection & type export
│   │   └── schema.ts       # Drizzle schema definitions
│   ├── types/              # TypeScript types & interfaces
│   │   ├── repository.ts   # Repository interfaces
│   │   └── errors.ts       # Custom error classes
│   ├── app.ts              # App initialization
│   └── index.ts            # Server entry point
├── drizzle/                # Migration files
├── index.ts                # Bun server entry
├── drizzle.config.ts       # Drizzle configuration
└── package.json
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│ Controllers │ ──► │   Services   │ ──► │  Repositories   │ ──► │ Database │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────┘
       ▲                   ▲                    ▲
       └───────────────────┴────────────────────┘
                    DI Container
```

- **Controllers**: Handle HTTP requests/responses, validation
- **Services**: Business logic, orchestration, error handling
- **Repositories**: Data access, database queries
- **Container**: Dependency injection, service lifecycle

## Getting Started

### Install dependencies

```bash
bun install
```

### Run development server

```bash
bun run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | `/`             | Health check      |
| GET    | `/api/users`    | List all users    |
| GET    | `/api/users/:id`| Get user by ID    |
| POST   | `/api/users`    | Create user       |
| PUT    | `/api/users/:id`| Update user       |
| DELETE | `/api/users/:id`| Delete user       |

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

## Database Commands

```bash
# Generate migrations after schema changes
bun run db:generate

# Apply migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Adding New Features

### 1. Create Schema (`src/db/schema.ts`)

```typescript
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  userId: integer("user_id").references(() => users.id),
});
```

### 2. Create Repository (`src/repositories/post-repository.ts`)

```typescript
export class PostRepository implements IPostRepository {
  constructor(private db: DrizzleDatabase) {}
  // Implement data access methods
}
```

### 3. Create Service (`src/services/post-service.ts`)

```typescript
export class PostService {
  constructor(private postRepository: IPostRepository) {}
  // Implement business logic
}
```

### 4. Create Controller (`src/controllers/post-controller.ts`)

```typescript
export class PostController {
  constructor(private postService: PostService) {}
  // Implement HTTP handlers
}
```

### 5. Register in DI Container (`src/container/di-container.ts`)

```typescript
export const POST_REPOSITORY_TOKEN = createIdentifier<PostRepository>("postRepository");
export const POST_SERVICE_TOKEN = createIdentifier<PostService>("postService");
export const POST_CONTROLLER_TOKEN = createIdentifier<PostController>("postController");

// Bind in createContainer()
container.bind(POST_REPOSITORY_TOKEN).toFactory(() => {
  const db = container.get(DB_TOKEN);
  return new PostRepository(db);
});
// ... etc
```

### 6. Add Routes (`src/routes/posts.ts`)

```typescript
export function createPostRoutes(postController: PostController): Hono {
  const routes = new Hono();
  routes.get("/", (c) => postController.getAll(c));
  // ... etc
  return routes;
}
```

### 7. Wire in App (`src/app.ts`)

```typescript
const postController = container.get(POST_CONTROLLER_TOKEN);
app.route("/api/posts", createPostRoutes(postController));
```
