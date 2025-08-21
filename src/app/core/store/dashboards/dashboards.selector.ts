import { createSelector } from '@ngrx/store';
import { DashboardsFeature } from './dashboards.feature';
import { buildDashboardHierarchy } from '../../../utils';

export const {
  selectDashboards,
  selectError,
  selectIsLoading,
  selectActiveDashboardId,
} = DashboardsFeature;

export const selectActiveDashboard = createSelector(
  selectDashboards,
  selectActiveDashboardId,
  (dashboards, activeId) => {
    if (!activeId || !dashboards) return null;

    const allDashboards = Object.values(dashboards).flat();
    return allDashboards.find((d) => d?.id === activeId) ?? null;
  }
);

export const selectDashboardsByInterfaceId = (interfaceId: string) =>
  createSelector(
    selectDashboards,
    (dashboards) => dashboards[interfaceId] || []
  );

export const selectRootDashboardsByInterfaceId = (interfaceId: string) =>
  createSelector(
    selectDashboardsByInterfaceId(interfaceId),
    (interfaceDashboards) =>
      interfaceDashboards.filter((dashboard) => dashboard.parentId === null)
  );

export const selectDashboardHierarchyByInterfaceId = (interfaceId: string) =>
  createSelector(
    selectDashboardsByInterfaceId(interfaceId),
    (interfaceDashboards) => buildDashboardHierarchy(interfaceDashboards)
  );

export const selectDashboardById = (id: string) =>
  createSelector(selectDashboards, (dashboards) => dashboards[id] || []);

export const selectSelectionsByActiveDashboard = createSelector(
  selectActiveDashboard,
  (dashboard) => dashboard?.selections || []
);
