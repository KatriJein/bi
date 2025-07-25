export type CreateDashboardFilterResponse = {
  createDashboardFilter: {
    dashboardFilter: DashboardFilter;
  };
};

export type CreateDashboardFilterVariables = {
  dashboardId: string;
  name: string;
  fieldType: string;
  filterType: string;
};

export type DashboardFilter = {
  id: string;
  dashboardId: string;
  name: string;
  fieldType: string;
  filterType: string;
};
