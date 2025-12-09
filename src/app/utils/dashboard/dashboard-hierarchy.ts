import { DashboardDto } from '../../core/store/dashboards';
import { WidgetDto } from '../../core/store/widgets';
import { sortByOrder } from '../../core/utils';

export function buildDashboardHierarchy(
  dashboards: DashboardDto[]
): DashboardDto[] {
  const dashboardMap = new Map<
    string,
    DashboardDto
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

export function findFirstDashboardWithWidgets(
  node: DashboardDto,
  widgetsRecord: Record<string, WidgetDto[]>
): string | null {
  const widgets = widgetsRecord[node.id!] || [];
  if (widgets.length > 0) {
    return node.id!;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findFirstDashboardWithWidgets(child, widgetsRecord);
      if (found) return found;
    }
  }

  return null;
}

export function getFallbackDashboard(node: DashboardDto): string {
  if (node.children && node.children.length > 0) {
    return node.children[0].id!;
  }
  return node.id!;
}
