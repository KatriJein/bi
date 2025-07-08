import { createFeature, createReducer, on } from '@ngrx/store';
import * as ChartsActions from './charts.actions';

export type SortingType = {
  columnName: string;
  direction: 'asc' | 'desc';
};

export type FilterType = {
  columnName: string;
  filterType: string;
  value: any;
};

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'table'
  | 'doughnut'
  | 'horizontalBar';

export interface ChartDto {
  id: string | null;
  name: string;
  datasetId: string | null;
  xAxis: string | null;
  yAxis: string[] | null;
  filters: FilterType[] | null;
  sorting: SortingType[] | null;
  settings?: {
    chartType?: ChartType;
    colors?: string[];
    [key: string]: any;
  } | null;
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
    }))
  ),
});
