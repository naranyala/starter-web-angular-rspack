import { Context } from "hono";
import type { UserService } from "../services";
import type { NewUser } from "../types";

export class UserController {
  constructor(private userService: UserService) {}

  async getAll(c: Context) {
    const users = await this.userService.getAllUsers();
    return c.json(users);
  }

  async getById(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }
    const user = await this.userService.getUserById(id);
    return c.json(user);
  }

  async create(c: Context) {
    try {
      const body = await c.req.json<NewUser>();
      
      if (!body.name || !body.email) {
        return c.json({ error: "Name and email are required" }, 400);
      }

      const user = await this.userService.createUser(body);
      return c.json(user, 201);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return c.json({ error: "Invalid JSON" }, 400);
      }
      throw error;
    }
  }

  async update(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    try {
      const body = await c.req.json<Partial<NewUser>>();
      const user = await this.userService.updateUser(id, body);
      return c.json(user);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return c.json({ error: "Invalid JSON" }, 400);
      }
      throw error;
    }
  }

  async delete(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }
    await this.userService.deleteUser(id);
    return c.json({ message: "User deleted successfully" });
  }
}
