import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WidgetState } from './widgets.feature';

export const selectWidgetFeature =
  createFeatureSelector<WidgetState>('widgets');

export const selectWidgetsByDashboard = (dashboardId: string) =>
  createSelector(
    selectWidgetFeature,
    (state) => state.widgets[dashboardId] || []
  );

export const selectWidgetsLoading = createSelector(
  selectWidgetFeature,
  (state) => state.isLoading
);

export const selectWidgetsError = createSelector(
  selectWidgetFeature,
  (state) => state.error
);
