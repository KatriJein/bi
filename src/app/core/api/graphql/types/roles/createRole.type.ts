import { Permission } from '../../../../store/user';

export type CreateRoleVariables = {
  name: string;
  permissions?: Permission[];
};
