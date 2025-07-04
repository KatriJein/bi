export type UpdateDashboardOrderMutationVariables = {
  dashboardId: string;
  interfaceId: string;
  order: number;
  newOrder: number;
};

export type UpdateDashboardOrderMutationResponse = {
  updateInterfaceDashboard: {
    interfaceDashboard: {
      order: number;
      dashboard: { id: string };
    };
  };
};
