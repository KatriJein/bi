import { createFeature, createReducer, on } from '@ngrx/store';
import * as ChartsActions from './charts.actions';
import { ChartFilter } from '../../api/graphql/types';

export type SortingType = {
  columnName: string;
  direction: 'asc' | 'desc';
};

export type FilterType = {
  columnName: string;
  filterType: string;
  value: any;
};

export type SelectionTypeChart = {
  name: string;
  columnName: string;
  columnType: string;
  filterType: string;
};

export type SelectionTypeDashboard = {
  name: string;
  columnType: string;
  filterType: string;
  value: any;
};

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'table'
  | 'doughnut'
  | 'horizontalBar'
  | 'doughnutPercent';

export interface ChartDto {
  id: string | null;
  name: string;
  datasetId: string | null;
  childId: string | null;
  xAxis: string | null;
  yAxis: string[] | null;
  filters: FilterType[] | null;
  sorting: SortingType[] | null;
  settings?: {
    chartType?: ChartType;
    colors?: string[];
    [key: string]: any;
  } | null;
  selections?: ChartFilter[] | null;
}

export interface ChartsState {
  charts: ChartDto[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: ChartsState = {
  charts: [],
  isLoading: false,
  error: null,
};

export const ChartsFeature = createFeature({
  name: 'charts',
  reducer: createReducer(
    initialState,

    //Загрузка
    on(ChartsActions.loadCharts, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ChartsActions.loadChartsSuccess, (state, { charts }) => ({
      ...state,
      charts,
      isLoading: false,
    })),
    on(ChartsActions.loadChartsFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Создание
    on(ChartsActions.createChart, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ChartsActions.createChartSuccess, (state, { chart }) => ({
      ...state,
      isLoading: false,
      charts: [...state.charts, chart],
    })),
    on(ChartsActions.createChartFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Обновление
    on(ChartsActions.updateChart, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ChartsActions.updateChartSuccess, (state, { chart }) => ({
      ...state,
      isLoading: false,
      charts: state.charts.map((d) => (d.id === chart.id ? chart : d)),
    })),
    on(ChartsActions.updateChartFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Удаление
    on(ChartsActions.deleteChart, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ChartsActions.deleteChartSuccess, (state, { id }) => ({
      ...state,
      isLoading: false,
      charts: state.charts.filter((d) => d.id !== id),
    })),
    on(ChartsActions.deleteChartFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Фильтры
    // Загрузка фильтров
    on(ChartsActions.loadChartFilters, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ChartsActions.loadChartFiltersSuccess, (state, { filters }) => {
      const charts = state.charts.map((chart) => ({
        ...chart,
        selections: filters.filter((f) => f.chartId === chart.id),
      }));

      return {
        ...state,
        charts,
        isLoading: false,
      };
    }),
    on(ChartsActions.loadChartFiltersFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Создание фильтра
    on(ChartsActions.createChartFilterSuccess, (state, { filter }) => ({
      ...state,
      charts: state.charts.map((chart) =>
        chart.id === filter.chartId
          ? {
              ...chart,
              selections: [...(chart.selections ?? []), filter],
            }
          : chart
      ),
    })),
    on(ChartsActions.createChartFilterFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Обновление фильтра
    on(ChartsActions.updateChartFilterSuccess, (state, { filter }) => ({
      ...state,
      charts: state.charts.map((chart) =>
        chart.id === filter.chartId
          ? {
              ...chart,
              selections:
                chart.selections?.map((f) =>
                  f.id === filter.id ? filter : f
                ) ?? [],
            }
          : chart
      ),
    })),
    on(ChartsActions.updateChartFilterFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Удаление фильтра
    on(ChartsActions.deleteChartFilterSuccess, (state, { id }) => ({
      ...state,
      charts: state.charts.map((chart) => ({
        ...chart,
        selections: chart.selections?.filter((f) => f.id !== id) ?? [],
      })),
    })),
    on(ChartsActions.deleteChartFilterFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Загрузка графика
    on(ChartsActions.loadChart, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ChartsActions.loadChartSuccess, (state, { chart }) => {
      const chartIndex = state.charts.findIndex((c) => c.id === chart.id);

      let updatedCharts;
      if (chartIndex >= 0) {
        updatedCharts = [...state.charts];
        updatedCharts[chartIndex] = chart;
      } else {
        updatedCharts = [...state.charts, chart];
      }

      return {
        ...state,
        charts: updatedCharts,
        isLoading: false,
        error: null,
      };
    }),

    on(ChartsActions.loadChartFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    // Загрузка фильтров графика
    on(
      ChartsActions.loadChartSelectionsSuccess,
      (state, { chartId, filters }) => ({
        ...state,
        charts: state.charts.map((chart) =>
          chart.id === chartId ? { ...chart, selections: filters } : chart
        ),
        isLoading: false,
        error: null,
      })
    ),

    on(ChartsActions.loadChartSelectionsFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    }))
  ),
});
