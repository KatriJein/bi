import { createSelector } from '@ngrx/store';
import { DashboardsFeature } from './dashboards.feature';
import { buildDashboardHierarchy } from '../../../utils';
import { DashboardFilter } from '../../api/graphql/types';

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

export const selectMultipleSelectionsByActiveDashboard = createSelector(
  selectActiveDashboard,
  (dashboard): DashboardFilter[] => {
    if (!dashboard?.selections) return [];
    return dashboard.selections.filter((f) => f.isMultiple);
  }
);

export const selectActiveMultipleSelections = createSelector(
  DashboardsFeature.selectActiveMultipleSelections,
  (active) => active
);

export const selectEffectiveSelectionsByActiveDashboard = createSelector(
  selectActiveDashboard,
  selectActiveMultipleSelections,
  (dashboard, activeMultipleSelections): DashboardFilter[] => {
    if (!dashboard?.selections) return [];

    return dashboard.selections
      .map((filter) => {
        if (filter.isMultiple) {
          const active = activeMultipleSelections[filter.id];
          if (active === undefined) {
            return null;
          }
          return { ...filter, value: { value: active } };
        }
        return filter;
      })
      .filter((f): f is DashboardFilter => f !== null);
  }
);

export const selectEffectiveSelectionsByDashboardId = (dashboardId: string) =>
  createSelector(
    selectDashboards,
    selectActiveMultipleSelections,
    (dashboards, activeMultipleSelections): DashboardFilter[] => {
      const dashboard = Object.values(dashboards)
        .flat()
        .find((d) => d?.id === dashboardId);

      if (!dashboard?.selections) return [];

      return dashboard.selections.map((filter) => {
        if (filter.isMultiple) {
          const active = activeMultipleSelections[filter.id];
          return { ...filter, value: { value: active } };
        }
        return filter;
      });
    }
  );
