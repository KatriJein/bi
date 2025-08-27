import { createAction, props } from '@ngrx/store';
import { ChartDto } from './charts.feature';
import { Chart } from '../../models';
import {
  ChartFilter,
  CreateChartFilterVariables,
  UpdateChartFilterVariables,
} from '../../api/graphql/types';

// Загрузка
export const loadCharts = createAction('[Charts] Load Charts');
export const loadChartsSuccess = createAction(
  '[Charts] Load Charts Success',
  props<{ charts: ChartDto[] }>()
);
export const loadChartsFailure = createAction(
  '[Charts] Load Charts Failure',
  props<{ error: string }>()
);

// Добавление
export const createChart = createAction(
  '[Chart] Create Chart',
  props<{ chart: ChartDto }>()
);
export const createChartSuccess = createAction(
  '[Chart] Create Chart Success',
  props<{ chart: ChartDto }>()
);
export const createChartFailure = createAction(
  '[Chart] Create Chart Failure',
  props<{ error: any }>()
);

// Обновление
export const updateChart = createAction(
  '[Chart] Update Chart',
  props<{ chart: ChartDto }>()
);
export const updateChartSuccess = createAction(
  '[Chart] Update Chart Success',
  props<{ chart: ChartDto }>()
);
export const updateChartFailure = createAction(
  '[Chart] Update Chart Failure',
  props<{ error: any }>()
);

// Удаление
export const deleteChart = createAction(
  '[Chart] Delete Chart',
  props<{ id: string }>()
);
export const deleteChartSuccess = createAction(
  '[Chart] Delete Chart Success',
  props<{ id: string }>()
);
export const deleteChartFailure = createAction(
  '[Chart] Delete Chart Failure',
  props<{ error: any }>()
);

// Загрузка фильтров
export const loadChartFilters = createAction('[Charts] Load Chart Filters');

export const loadChartFiltersSuccess = createAction(
  '[Charts] Load Chart Filters Success',
  props<{ filters: ChartFilter[] }>()
);

export const loadChartFiltersFailure = createAction(
  '[Charts] Load Chart Filters Failure',
  props<{ error: string }>()
);

// Добавление фильтра
export const createChartFilter = createAction(
  '[Charts] Create Chart Filter',
  props<{ filter: CreateChartFilterVariables }>()
);

export const createChartFilterSuccess = createAction(
  '[Charts] Create Chart Filter Success',
  props<{ filter: ChartFilter }>()
);

export const createChartFilterFailure = createAction(
  '[Charts] Create Chart Filter Failure',
  props<{ error: string }>()
);

// Обновление фильтра
export const updateChartFilter = createAction(
  '[Charts] Update Chart Filter',
  props<{ id: string; patch: UpdateChartFilterVariables['patch'] }>()
);

export const updateChartFilterSuccess = createAction(
  '[Charts] Update Chart Filter Success',
  props<{ filter: ChartFilter }>()
);

export const updateChartFilterFailure = createAction(
  '[Charts] Update Chart Filter Failure',
  props<{ error: string }>()
);

// Удаление фильтра
export const deleteChartFilter = createAction(
  '[Charts] Delete Chart Filter',
  props<{ id: string }>()
);

export const deleteChartFilterSuccess = createAction(
  '[Charts] Delete Chart Filter Success',
  props<{ id: string }>()
);

export const deleteChartFilterFailure = createAction(
  '[Charts] Delete Chart Filter Failure',
  props<{ error: string }>()
);

// Загрузка графика
export const loadChart = createAction(
  '[Charts] Load Chart',
  props<{ chartId: string }>()
);

export const loadChartSuccess = createAction(
  '[Charts] Load Chart Success',
  props<{ chart: ChartDto }>()
);

export const loadChartFailure = createAction(
  '[Charts] Load Chart Failure',
  props<{ error: string }>()
);

// Загрузка фильтров одного графика
export const loadChartSelections = createAction(
  '[Charts] Load Chart Selections',
  props<{ chartId: string }>()
);

export const loadChartSelectionsSuccess = createAction(
  '[Charts] Load Chart Selections Success',
  props<{ chartId: string; filters: ChartFilter[] }>()
);

export const loadChartSelectionsFailure = createAction(
  '[Charts] Load Chart Selections Failure',
  props<{ error: string }>()
);
