export interface IUserRepository {
  findAll: () => Promise<User[]>;
  findById: (id: number) => Promise<User | undefined>;
  findByEmail: (email: string) => Promise<User | undefined>;
  create: (data: NewUser) => Promise<User>;
  update: (id: number, data: Partial<NewUser>) => Promise<User | undefined>;
  delete: (id: number) => Promise<boolean>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string | null;
}

export interface NewUser {
  name: string;
  email: string;
}
