export type CreateDashboardResponse = {
  createDashboard: {
    dashboard: {
      id: string;
    };
  };
};

export type CreateDashboardVariables = {
  name: string;
  parentId: string | null;
};
