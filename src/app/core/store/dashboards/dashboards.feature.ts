import { createFeature, createReducer, on } from '@ngrx/store';
import * as DashboardsActions from './dashboards.actions';
import { sortByOrder } from '../../utils/sort.utils';

export interface DashboardDto {
  id: string | undefined;
  iconId: string | undefined;
  color: string | undefined;
  name: string | undefined;
  order: number | undefined;
}

export interface DashboardState {
  dashboards: Record<string, DashboardDto[]>;
  activeDashboardId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  dashboards: {},
  activeDashboardId: null,
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
    }))
  ),
});
