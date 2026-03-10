import { createFeature, createReducer, on } from '@ngrx/store';
import * as DatasetsActions from './datasets.actions';
import { Column } from '../../models';

export interface DatasetDto {
  id: string;
  connection: string;
  query: string;
  settings: Object;
  name: string;
  tableName: string;
  columns: Column[];
}

export interface DatasetsState {
  datasets: DatasetDto[];
  isLoading: boolean;
  error: string | null;
  loaded: boolean
}

export const initialState: DatasetsState = {
  datasets: [],
  isLoading: false,
  error: null,
  loaded: false
};

export const DatasetsFeature = createFeature({
  name: 'datasets',
  reducer: createReducer(
    initialState,
    // Загрузка
    on(DatasetsActions.loadDatasets, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(DatasetsActions.loadDatasetsSuccess, (state, { datasets }) => ({
      ...state,
      datasets,
      isLoading: false,
      loaded: true,
    })),
    on(DatasetsActions.loadDatasetsFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Загрузка датасета
    on(DatasetsActions.loadDataset, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(DatasetsActions.loadDatasetSuccess, (state, { dataset }) => ({
      ...state,
      datasets: [dataset],
      isLoading: false,
    })),
    on(DatasetsActions.loadDatasetFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Добавление
    on(DatasetsActions.addDataset, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(DatasetsActions.addDatasetSuccess, (state, { dataset }) => ({
      ...state,
      isLoading: false,
      datasets: [...state.datasets, dataset],
    })),
    on(DatasetsActions.addDatasetFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Обновление
    on(DatasetsActions.updateDataset, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(DatasetsActions.updateDatasetSuccess, (state, { dataset }) => ({
      ...state,
      isLoading: false,
      datasets: state.datasets.map((d) => (d.id === dataset.id ? dataset : d)),
    })),
    on(DatasetsActions.updateDatasetFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Удаление
    on(DatasetsActions.deleteDataset, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(DatasetsActions.deleteDatasetSuccess, (state, { id }) => ({
      ...state,
      isLoading: false,
      datasets: state.datasets.filter((d) => d.id !== id),
    })),
    on(DatasetsActions.deleteDatasetFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    }))
  ),
});
