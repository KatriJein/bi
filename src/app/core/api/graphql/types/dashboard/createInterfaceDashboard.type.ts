import { Dashboard } from './getUserDashboards.type';

export type CreateInterfaceDashboardMutationVariables = {
  dashboardId: string;
  interfaceId: string;
  order?: number | null;
};

export type CreateInterfaceDashboardMutation = {
  createInterfaceDashboard: {
    interfaceDashboard: {
      order: number;
      dashboard: Dashboard;
    };
  };
};
