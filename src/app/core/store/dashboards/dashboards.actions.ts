import { createAction, props } from '@ngrx/store';
import { DashboardDto } from './dashboards.feature';
import {
  DashboardFilter,
  DashboardPatch,
  UpdateDashboardFilterVariables,
} from '../../api/graphql/types';

export const loadDashboards = createAction(
  '[Dashboards] Load Dashboards',
  props<{ interfaceId: string }>()
);
export const loadDashboardsSuccess = createAction(
  '[Dashboards] Load Dashboards Success',
  props<{ interfaceId: string; dashboards: DashboardDto[] }>()
);
export const loadDashboardsFailure = createAction(
  '[Dashboards] Load Dashboards Failure',
  props<{ error: string }>()
);

// Добавление
export const addDashboard = createAction(
  '[Dashboards] Add Dashboard',
  props<{
    name: string;
    parentId: string | null;
    interfaceId: string;
    order?: number;
  }>()
);

export const addDashboardSuccess = createAction(
  '[Dashboards] Add Dashboard Success',
  props<{ interfaceId: string; dashboard: DashboardDto }>()
);

export const addDashboardFailure = createAction(
  '[Dashboards] Add Dashboard Failure',
  props<{ error: string }>()
);

// Удаление
export const removeDashboard = createAction(
  '[Dashboards] Remove Dashboard',
  props<{ dashboardId: string; interfaceId: string; order: number }>()
);

export const removeDashboardSuccess = createAction(
  '[Dashboards] Remove Dashboard Success',
  props<{ interfaceId: string; id: string }>()
);

export const removeDashboardFailure = createAction(
  '[Dashboards] Remove Dashboard Failure',
  props<{ error: string }>()
);

// Обновление
export const updateDashboard = createAction(
  '[Dashboards] Update Dashboard',
  props<{ id: string; patch: DashboardPatch; interfaceId: string }>()
);

export const updateDashboardSuccess = createAction(
  '[Dashboards] Update Dashboard Success',
  props<{ dashboard: Partial<DashboardDto>; interfaceId: string }>()
);

export const updateDashboardFailure = createAction(
  '[Dashboards] Update Dashboard Failure',
  props<{ error: string }>()
);

// Обновление порядка
export const updateDashboardOrder = createAction(
  '[Dashboards] Update Dashboard Order',
  props<{
    dashboardId: string;
    interfaceId: string;
    order: number;
    newOrder: number;
  }>()
);

export const updateDashboardOrderSuccess = createAction(
  '[Dashboards] Update Dashboard Order Success',
  props<{ dashboardId: string; order: number; interfaceId: string }>()
);

export const updateDashboardOrderFailure = createAction(
  '[Dashboards] Update Dashboard Order Failure',
  props<{ error: string }>()
);

export const setActiveDashboard = createAction(
  '[Dashboards] Set Active Dashboard',
  props<{ id: string | null }>()
);

// Фильтры
// Загрузка фильтров
export const loadDashboardFilters = createAction(
  '[DashboardFilters] Load Filters'
);
export const loadDashboardFiltersSuccess = createAction(
  '[DashboardFilters] Load Filters Success',
  props<{ filters: DashboardFilter[] }>()
);
export const loadDashboardFiltersFailure = createAction(
  '[DashboardFilters] Load Filters Failure',
  props<{ error: string }>()
);

// Создание фильтра
export const createDashboardFilter = createAction(
  '[DashboardFilters] Create Filter',
  props<{
    filter: Omit<DashboardFilter, 'id'>;
  }>()
);
export const createDashboardFilterSuccess = createAction(
  '[DashboardFilters] Create Filter Success',
  props<{ filter: DashboardFilter }>()
);
export const createDashboardFilterFailure = createAction(
  '[DashboardFilters] Create Filter Failure',
  props<{ error: string }>()
);

// Обновление фильтра
export const updateDashboardFilter = createAction(
  '[DashboardFilters] Update Filter',
  props<{ id: string; patch: UpdateDashboardFilterVariables['patch'] }>()
);
export const updateDashboardFilterSuccess = createAction(
  '[DashboardFilters] Update Filter Success',
  props<{ filter: DashboardFilter }>()
);
export const updateDashboardFilterFailure = createAction(
  '[DashboardFilters] Update Filter Failure',
  props<{ error: string }>()
);

// Удаление фильтра
export const deleteDashboardFilter = createAction(
  '[DashboardFilters] Delete Filter',
  props<{ id: string }>()
);
export const deleteDashboardFilterSuccess = createAction(
  '[DashboardFilters] Delete Filter Success',
  props<{ id: string }>()
);
export const deleteDashboardFilterFailure = createAction(
  '[DashboardFilters] Delete Filter Failure',
  props<{ error: string }>()
);
