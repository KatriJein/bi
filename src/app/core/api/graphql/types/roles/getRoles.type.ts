import { Permission } from '../../../../store/user';

export type GetRolesType = {
  roles: {
    nodes: Role[];
  }
};

export type Role = {
  id: string;
  name: string;
  permissions: Permission[];
};
