import { createSelector } from '@ngrx/store';
import { DashboardsFeature } from './dashboards.feature';

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

export const selectDashboardById = (id: string) =>
  createSelector(selectDashboards, (dashboards) => dashboards[id] || []);

