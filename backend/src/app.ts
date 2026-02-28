import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AppError } from "./types/errors";
import { createContainer, USER_CONTROLLER_TOKEN } from "./container/di-container";
import { createUserRoutes } from "./routes/users";

export function createApp(): Hono {
  const container = createContainer();
  const userController = container.get(USER_CONTROLLER_TOKEN);

  const app = new Hono();

  // Middleware
  app.use("*", logger());
  app.use("*", cors());

  // Health check
  app.get("/", (c) => {
    return c.json({
      message: "Hono.js + Drizzle SQLite API",
      status: "running",
    });
  });

  // API routes
  app.route("/api/users", createUserRoutes(userController));

  // 404 handler
  app.notFound((c) => {
    return c.json({ error: "Not Found" }, 404);
  });

  // Error handler
  app.onError((err, c) => {
    console.error(err);

    if (err instanceof AppError) {
      return c.json({ error: err.message, code: err.code }, err.statusCode);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  });

  return app;
}

const app = createApp();
export default app;
