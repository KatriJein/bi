import { User, UserRoleNode } from './common.type';

export type CreateUserRoleVariables = {
  userId: string;
  roleId: string;
};

export type CreateUserRoleResponse = {
  createUserRole: {
    user: User & {
      userRoles: {
        nodes: UserRoleNode[];
      };
    };
  };
};
