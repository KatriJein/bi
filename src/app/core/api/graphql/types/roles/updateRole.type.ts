import { Permission } from '../../../../store/user';

export interface UpdateRoleVariables {
  id: string;
  name?: string | null;
  permissions?: Permission[] | null;
}
