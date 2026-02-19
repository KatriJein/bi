import { User } from './common.type';

export type CreateUserVariables = {
  name: string;
  password?: string | null;
};

export type CreateUserResponse = {
  createUser: {
    user: User;
  };
};
