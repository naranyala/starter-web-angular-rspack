import type { IUserRepository, User, NewUser } from "../types";
import { AppError, ErrorCodes } from "../types/errors";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
    }
    return user;
  }

  async createUser(data: NewUser): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already exists", 409, ErrorCodes.CONFLICT);
    }
    return this.userRepository.create(data);
  }

  async updateUser(id: number, data: Partial<NewUser>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
    }

    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new AppError("Email already exists", 409, ErrorCodes.CONFLICT);
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new AppError("Failed to update user", 500, ErrorCodes.INTERNAL_ERROR);
    }
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
    }
  }
}
