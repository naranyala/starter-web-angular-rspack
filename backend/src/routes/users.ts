import { Hono } from "hono";
import type { UserController } from "../controllers";

export function createUserRoutes(userController: UserController): Hono {
  const routes = new Hono();

  routes.get("/", (c) => userController.getAll(c));
  routes.get("/:id", (c) => userController.getById(c));
  routes.post("/", (c) => userController.create(c));
  routes.put("/:id", (c) => userController.update(c));
  routes.delete("/:id", (c) => userController.delete(c));

  return routes;
}
