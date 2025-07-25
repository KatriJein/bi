import { DashboardFilter } from './create-dashboard-filter.type';

export type GetDashboardFiltersResponse = {
  dashboardFilters: {
    nodes: DashboardFilter[];
  };
};
