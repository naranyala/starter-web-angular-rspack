import { Container, createIdentifier } from "./container";
import { db, type DrizzleDatabase } from "../db";
import { UserRepository } from "../repositories";
import { UserService } from "../services";
import { UserController } from "../controllers";

// Service identifiers for DI
export const DB_TOKEN = createIdentifier<DrizzleDatabase>("database");
export const USER_REPOSITORY_TOKEN = createIdentifier<UserRepository>("userRepository");
export const USER_SERVICE_TOKEN = createIdentifier<UserService>("userService");
export const USER_CONTROLLER_TOKEN = createIdentifier<UserController>("userController");

export function createContainer(): Container {
  const container = new Container();

  // Register database
  container.bind(DB_TOKEN).toConstantValue(db);

  // Register repository
  container.bind(USER_REPOSITORY_TOKEN).toFactory(() => {
    const database = container.get(DB_TOKEN);
    return new UserRepository(database);
  });

  // Register service
  container.bind(USER_SERVICE_TOKEN).toFactory(() => {
    const userRepository = container.get(USER_REPOSITORY_TOKEN);
    return new UserService(userRepository);
  });

  // Register controller
  container.bind(USER_CONTROLLER_TOKEN).toFactory(() => {
    const userService = container.get(USER_SERVICE_TOKEN);
    return new UserController(userService);
  });

  return container;
}
