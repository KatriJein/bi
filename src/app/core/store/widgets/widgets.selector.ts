import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WidgetsFeature } from './widgets.feature';

export const {
  selectWidgets,
  selectError,
  selectIsLoading,
  selectWidgetsState,
} = WidgetsFeature;

export const selectWidgetsByDashboard = (dashboardId: string) =>
  createSelector(
    selectWidgetsState,
    (state) => state.widgets[dashboardId] || []
  );

export const selectSelectionsByWidgetId = (widgetId: string) =>
  createSelector(selectWidgets, (widgets) => {
    for (const dashboardId in widgets) {
      const widget = widgets[dashboardId].find((w) => w.id === widgetId);
      if (widget) return widget.selections || [];
    }
    return [];
  });

export const selectWidgetById = (widgetId: string) =>
  createSelector(selectWidgets, (widgets) => {
    for (const dashboardId in widgets) {
      const widget = widgets[dashboardId].find((w) => w.id === widgetId);
      if (widget) return widget || null;
    }
    return null;
  });
