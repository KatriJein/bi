import { Dashboard } from './getUserDashboards.type';

export type DashboardPatch = {
  color?: string;
  iconId?: string;
  name?: string;
};

export type UpdateDashboardInput = {
  id: string;
  patch: DashboardPatch;
};

export type UpdateDashboardMutationResponse = {
  updateDashboard: {
    dashboard: Dashboard | null;
  };
};
