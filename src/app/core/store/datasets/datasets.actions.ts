import { createAction, props } from '@ngrx/store';
import { DatasetDto } from './datasets.feature';
import { Dataset } from '../../models';

// Загрузка
export const loadDatasets = createAction('[Datasets] Load Datasets');
export const loadDatasetsSuccess = createAction(
  '[Datasets] Load Datasets Success',
  props<{ datasets: DatasetDto[] }>()
);
export const loadDatasetsFailure = createAction(
  '[Datasets] Load Datasets Failure',
  props<{ error: string }>()
);

// Загрузка датасета
export const loadDataset = createAction(
  '[Dataset] Load Dataset',
  props<{ id: string }>()
);
export const loadDatasetSuccess = createAction(
  '[Dataset] Load Dataset Success',
  props<{ dataset: DatasetDto }>()
);
export const loadDatasetFailure = createAction(
  '[Dataset] Load Dataset Failure',
  props<{ error: string }>()
);

// Добавление
export const addDataset = createAction(
  '[Datasets] Add Dataset',
  props<{ dataset: Dataset }>()
);
export const addDatasetSuccess = createAction(
  '[Datasets] Add Dataset Success',
  props<{ dataset: DatasetDto }>()
);
export const addDatasetFailure = createAction(
  '[Datasets] Add Dataset Failure',
  props<{ error: string }>()
);

// Обновление
export const updateDataset = createAction(
  '[Datasets] Update Dataset',
  props<{ id: string; patch: Partial<Dataset> }>()
);
export const updateDatasetSuccess = createAction(
  '[Datasets] Update Dataset Success',
  props<{ dataset: DatasetDto }>()
);
export const updateDatasetFailure = createAction(
  '[Datasets] Update Dataset Failure',
  props<{ error: string }>()
);

// Удаление
export const deleteDataset = createAction(
  '[Datasets] Delete Dataset',
  props<{ id: string }>()
);
export const deleteDatasetSuccess = createAction(
  '[Datasets] Delete Dataset Success',
  props<{ id: string }>()
);
export const deleteDatasetFailure = createAction(
  '[Datasets] Delete Dataset Failure',
  props<{ error: string }>()
);
