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
  isMultiple: boolean;
  value: {
    value: any;
  };
  dateGranularity?: DateGranularity;
};

export type DashboardFilter = {
  id: string;
  dashboardId: string;
  name: string;
  isMultiple: boolean;
  fieldType: string;
  filterType: string;
  value: {
    value: any;
  };
  dateGranularity: DateGranularity;
};

export type DateGranularity = 'day' | 'month' | 'year';
