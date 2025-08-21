export type GetUserDashboardsType = {
  interfaceDashboards: {
    nodes: Array<{
      order: number;
      dashboard: Dashboard | null;
    }>;
  };
};

export type Dashboard = {
  id: string;
  name: string;
  color: string;
  iconId: string;
  parentId: string | null;
};
