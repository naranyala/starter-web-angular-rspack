import { eq } from "drizzle-orm";
import { DrizzleDatabase } from "../db";
import { users, type User as DbUser, type NewUser } from "../db/schema";
import type { IUserRepository, User } from "../types";

export class UserRepository implements IUserRepository {
  constructor(private db: DrizzleDatabase) {}

  async findAll(): Promise<User[]> {
    const result = await this.db.query.users.findMany();
    return result.map(this.mapToEntity);
  }

  async findById(id: number): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result ? this.mapToEntity(result) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result ? this.mapToEntity(result) : undefined;
  }

  async create(data: NewUser): Promise<User> {
    const result = await this.db.insert(users).values(data).returning();
    return this.mapToEntity(result[0]);
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const result = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return result.length > 0 ? this.mapToEntity(result[0]) : undefined;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  private mapToEntity(dbUser: DbUser): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      createdAt: dbUser.createdAt,
    };
  }
}
