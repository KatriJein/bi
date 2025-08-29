import { createFeature, createReducer, on } from '@ngrx/store';
import * as DashboardsActions from './dashboards.actions';
import { sortByOrder } from '../../utils/sort.utils';
import { DashboardFilter } from '../../api/graphql/types';

export interface DashboardDto {
  id: string | undefined;
  iconId: string | undefined;
  color: string | undefined;
  name: string | undefined;
  order: number | undefined;
  parentId: string | null | undefined;
  selections?: DashboardFilter[] | undefined;
}

export interface DashboardState {
  dashboards: Record<string, DashboardDto[]>;
  activeDashboardId: string | null;
  activeMultipleSelections: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  dashboards: {},
  activeDashboardId: null,
  activeMultipleSelections: {},
  isLoading: false,
  error: null,
};

export const DashboardsFeature = createFeature({
  name: 'dashboards',
  reducer: createReducer(
    initialState,
    // Загрузка
    on(DashboardsActions.loadDashboards, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      DashboardsActions.loadDashboardsSuccess,
      (state, { interfaceId, dashboards }) => ({
        ...state,
        dashboards: {
          ...state.dashboards,
          [interfaceId]: sortByOrder(dashboards),
        },
        isLoading: false,
      })
    ),
    on(DashboardsActions.loadDashboardsFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Добавление
    on(DashboardsActions.addDashboard, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      DashboardsActions.addDashboardSuccess,
      (state, { interfaceId, dashboard }) => {
        const currentDashboards = state.dashboards[interfaceId] || [];
        const newDashboards = [...currentDashboards, dashboard];

        return {
          ...state,
          isLoading: false,
          dashboards: {
            ...state.dashboards,
            [interfaceId]: sortByOrder(newDashboards),
          },
        };
      }
    ),
    on(DashboardsActions.addDashboardFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Удаление
    on(DashboardsActions.removeDashboard, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      DashboardsActions.removeDashboardSuccess,
      (state, { interfaceId, id }) => ({
        ...state,
        dashboards: {
          ...state.dashboards,
          [interfaceId]: state.dashboards[interfaceId].filter(
            (dashboard) => dashboard.id !== id
          ),
        },
        activeDashboardId:
          state.activeDashboardId === id ? null : state.activeDashboardId,
        isLoading: false,
      })
    ),
    on(DashboardsActions.removeDashboardFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Обновление дашборда
    on(DashboardsActions.updateDashboard, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      DashboardsActions.updateDashboardSuccess,
      (state, { interfaceId, dashboard }) => ({
        ...state,
        dashboards: {
          ...state.dashboards,
          [interfaceId]: state.dashboards[interfaceId].map((d) =>
            d.id === dashboard.id ? { ...d, ...dashboard } : d
          ),
        },
        isLoading: false,
      })
    ),
    on(DashboardsActions.updateDashboardFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Обновление порядка дашборда
    on(DashboardsActions.updateDashboardOrder, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      DashboardsActions.updateDashboardOrderSuccess,
      (state, { dashboardId, order, interfaceId }) => ({
        ...state,
        dashboards: {
          ...state.dashboards,
          [interfaceId]: sortByOrder(
            state.dashboards[interfaceId].map((dashboard) =>
              dashboard.id === dashboardId ? { ...dashboard, order } : dashboard
            )
          ),
        },
        isLoading: false,
      })
    ),
    on(DashboardsActions.updateDashboardOrderFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Активный дашборд
    on(DashboardsActions.setActiveDashboard, (state, { id }) => ({
      ...state,
      activeDashboardId: id,
    })),

    // Фильтры
    // Загрузка фильтров
    on(DashboardsActions.loadDashboardFilters, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),

    on(DashboardsActions.loadDashboardFiltersSuccess, (state, { filters }) => ({
      ...state,
      dashboards: Object.fromEntries(
        Object.entries(state.dashboards).map(([interfaceId, dashboards]) => [
          interfaceId,
          dashboards.map((dashboard) => ({
            ...dashboard,
            selections: filters.filter((f) => f.dashboardId === dashboard.id),
          })),
        ])
      ),
      isLoading: false,
    })),

    on(DashboardsActions.loadDashboardFiltersFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Создание фильтра
    on(DashboardsActions.createDashboardFilterSuccess, (state, { filter }) => ({
      ...state,
      dashboards: Object.fromEntries(
        Object.entries(state.dashboards).map(([interfaceId, dashboards]) => [
          interfaceId,
          dashboards.map((dashboard) =>
            dashboard.id === filter.dashboardId
              ? {
                  ...dashboard,
                  selections: [...(dashboard.selections ?? []), filter],
                }
              : dashboard
          ),
        ])
      ),
    })),

    on(DashboardsActions.createDashboardFilterFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Обновление фильтра
    on(DashboardsActions.updateDashboardFilterSuccess, (state, { filter }) => ({
      ...state,
      dashboards: Object.fromEntries(
        Object.entries(state.dashboards).map(([interfaceId, dashboards]) => [
          interfaceId,
          dashboards.map((dashboard) =>
            dashboard.id === filter.dashboardId
              ? {
                  ...dashboard,
                  selections:
                    dashboard.selections?.map((f) =>
                      f.id === filter.id ? filter : f
                    ) ?? [],
                }
              : dashboard
          ),
        ])
      ),
    })),

    on(DashboardsActions.updateDashboardFilterFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Удаление фильтра
    on(DashboardsActions.deleteDashboardFilterSuccess, (state, { id }) => ({
      ...state,
      dashboards: Object.fromEntries(
        Object.entries(state.dashboards).map(([interfaceId, dashboards]) => [
          interfaceId,
          dashboards.map((dashboard) => ({
            ...dashboard,
            selections: dashboard.selections?.filter((f) => f.id !== id) ?? [],
          })),
        ])
      ),
    })),

    on(DashboardsActions.deleteDashboardFilterFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Загрузка фильтров дашборда по id
    on(
      DashboardsActions.loadDashboardSelectionsSuccess,
      (state, { dashboardId, filters }) => {
        if (Object.keys(state.dashboards).length === 0) {
          const minimalDashboard: DashboardDto = {
            id: dashboardId,
            name: `Dashboard ${dashboardId}`,
            iconId: undefined,
            color: undefined,
            order: 0,
            parentId: null,
            selections: filters,
          };
          return {
            ...state,
            dashboards: {
              '1': [minimalDashboard],
            },
            activeDashboardId: dashboardId,
            isLoading: false,
            error: null,
          };
        }
        return {
          ...state,
          dashboards: Object.fromEntries(
            Object.entries(state.dashboards).map(([interfaceId, dashes]) => [
              interfaceId,
              dashes.map((d) =>
                d.id === dashboardId ? { ...d, selections: filters } : d
              ),
            ])
          ),
          activeDashboardId: dashboardId,
          isLoading: false,
          error: null,
        };
      }
    ),
    on(
      DashboardsActions.setActiveMultipleSelection,
      (state, { filterId, value }) => ({
        ...state,
        activeMultipleSelections: {
          ...state.activeMultipleSelections,
          [filterId]: value,
        },
      })
    ),

    on(
      DashboardsActions.clearActiveMultipleSelection,
      (state, { filterId }) => {
        const { [filterId]: removed, ...rest } = state.activeMultipleSelections;
        return {
          ...state,
          activeMultipleSelections: rest,
        };
      }
    )
  ),
});
