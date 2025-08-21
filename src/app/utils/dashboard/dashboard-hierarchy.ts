import { DashboardDto } from '../../core/store/dashboards';
import { sortByOrder } from '../../core/utils';

export function buildDashboardHierarchy(
  dashboards: DashboardDto[]
): DashboardDto[] {
  const dashboardMap = new Map<
    string,
    DashboardDto & { children?: DashboardDto[] }
  >();
  let rootDashboards: DashboardDto[] = [];

  dashboards.forEach((dashboard) => {
    dashboardMap.set(dashboard.id!, { ...dashboard, children: [] });
  });

  dashboards.forEach((dashboard) => {
    const current = dashboardMap.get(dashboard.id!)!;

    if (!dashboard.parentId) {
      rootDashboards.push(current);
    } else {
      const parent = dashboardMap.get(dashboard.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(current);
      }
    }
  });

  rootDashboards = sortByOrder(rootDashboards);
  dashboardMap.forEach((dashboard) => {
    if (dashboard.children) {
      sortByOrder(dashboard.children);
    }
  });

  return rootDashboards;
}
