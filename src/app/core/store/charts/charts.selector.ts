import { createSelector } from '@ngrx/store';
import { ChartsFeature } from './charts.feature';

export const { selectCharts, selectError, selectIsLoading } = ChartsFeature;

export const selectChartById = (id: string) =>
  createSelector(selectCharts, (charts) => charts.find((c) => c.id === id));

export const selectTableCharts = createSelector(selectCharts, (charts) =>
  charts.filter((chart) => chart.settings?.chartType === 'table')
);
