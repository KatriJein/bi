import { createAction, props } from '@ngrx/store';
import { ChartDto } from './charts.feature';
import { Chart } from '../../models';

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
