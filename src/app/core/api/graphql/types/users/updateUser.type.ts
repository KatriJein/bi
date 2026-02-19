import { User } from './common.type';

export type UpdateUserVariables = {
  id: string;
  name?: string | null;
  password?: string | null;
};

export type UpdateUserResponse = {
  updateUser: {
    user: Pick<User, 'id' | 'name' | 'password'>;
  };
};
