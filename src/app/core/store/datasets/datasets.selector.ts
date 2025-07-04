import { createSelector } from '@ngrx/store';
import { DatasetsFeature } from './datasets.feature';

export const { selectDatasets, selectIsLoading, selectError } = DatasetsFeature;

export const selectDatasetById = (id: string) =>
  createSelector(selectDatasets, (datasets) =>
    datasets.find((d) => d.id === id)
  );


