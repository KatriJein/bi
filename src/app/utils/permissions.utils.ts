import { Permission } from '../core/store/user';

export const PermissionMap: Record<string, Permission[]> = {
  datasets: ['datasets.manage'],
  charts: ['charts.manage'],
  interfaces: ['interfaces.manage'],
  dashboards: ['dashboards.manage', 'interfaces.manage'],
  users: ['users.manage'],
  roles: ['roles.manage'],
};
