import { DashboardFilter } from './create-dashboard-filter.type';

export type UpdateDashboardFilterResponse = {
  updateDashboardFilter: {
    dashboardFilter: DashboardFilter;
  };
};

export type UpdateDashboardFilterVariables = {
  id: string;
  patch: {
    dashboardId?: string;
    name?: string;
    fieldType?: string;
    filterType?: string;
    isMultiple?: boolean;
    value?: {
      value: any;
    };
  };
};
