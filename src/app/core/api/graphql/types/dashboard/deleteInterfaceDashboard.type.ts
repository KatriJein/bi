export type DeleteInterfaceDashboardResponse = {
  deleteInterfaceDashboard: {
    dashboard: {
      id: string;
    };
  };
};

export type DeleteInterfaceDashboardVariables = {
  dashboardId: string;
  interfaceId: string;
  order: number;
};
