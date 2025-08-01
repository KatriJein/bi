import { createFeature, createReducer, on } from '@ngrx/store';
import * as WidgetsActions from './widgets.actions';
import {
  VisualSettings,
  WidgetFilterBinding,
  WidgetType,
} from '../../api/graphql/types';
import { mapToWidgetDto } from '../../utils';

export interface WidgetDto {
  id: string;
  dashboardId: string;
  title: string;
  type: WidgetType;
  chartId?: string | null;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visualSettings?: VisualSettings;
  selections?: WidgetFilterBinding[];
}

export interface WidgetState {
  widgets: Record<string, WidgetDto[]>;
  isLoading: boolean;
  error: string | null;
}

export const initialState: WidgetState = {
  widgets: {},
  isLoading: false,
  error: null,
};

export const WidgetsFeature = createFeature({
  name: 'widgets',
  reducer: createReducer(
    initialState,
    on(WidgetsActions.loadWidgets, (state) => ({ ...state, isLoading: true })),
    on(
      WidgetsActions.loadWidgetsSuccess,
      (state, { dashboardId, widgets }) => ({
        ...state,
        isLoading: false,
        widgets: {
          ...state.widgets,
          [dashboardId]: widgets.map(mapToWidgetDto),
        },
        error: null,
      })
    ),
    on(WidgetsActions.loadWidgetsFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    on(
      WidgetsActions.createWidgetSuccess,
      (state, { dashboardId, widget }) => ({
        ...state,
        widgets: {
          ...state.widgets,
          [dashboardId]: [
            ...(state.widgets[dashboardId] || []),
            mapToWidgetDto(widget),
          ],
        },
      })
    ),

    on(
      WidgetsActions.updateWidgetSuccess,
      (state, { dashboardId, widget }) => ({
        ...state,
        widgets: {
          ...state.widgets,
          [dashboardId]: (state.widgets[dashboardId] || []).map((w) =>
            w.id === widget.id
              ? {
                  ...mapToWidgetDto(widget),
                  selections: w.selections,
                }
              : w
          ),
        },
      })
    ),

    on(
      WidgetsActions.deleteWidgetSuccess,
      (state, { dashboardId, widgetId }) => ({
        ...state,
        widgets: {
          ...state.widgets,
          [dashboardId]: (state.widgets[dashboardId] || []).filter(
            (w) => w.id !== widgetId
          ),
        },
      })
    ),

    // Widget Filter Bindings
    on(
      WidgetsActions.loadWidgetFilterBindingsSuccess,
      (state, { bindings }) => {
        const updatedWidgets = { ...state.widgets };

        const widgetBindingsMap = new Map<string, WidgetFilterBinding[]>();
        bindings.forEach((binding) => {
          if (!widgetBindingsMap.has(binding.widgetId)) {
            widgetBindingsMap.set(binding.widgetId, []);
          }
          widgetBindingsMap.get(binding.widgetId)!.push(binding);
        });

        for (const [dashboardId, widgets] of Object.entries(updatedWidgets)) {
          updatedWidgets[dashboardId] = widgets.map((widget) => {
            const widgetBindings = widgetBindingsMap.get(widget.id) || [];

            if (widgetBindings.length === 0) {
              return widget;
            }

            const existingIds = new Set(
              (widget.selections || []).map((b) => b.id)
            );
            const newBindings = widgetBindings.filter(
              (b) => !existingIds.has(b.id)
            );

            return {
              ...widget,
              selections: [...(widget.selections || []), ...newBindings],
            };
          });
        }

        return {
          ...state,
          widgets: updatedWidgets,
        };
      }
    ),

    on(WidgetsActions.loadWidgetFilterBindingsFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    on(
      WidgetsActions.createWidgetFilterBindingSuccess,
      (state, { binding }) => {
        const updatedWidgets = { ...state.widgets };

        for (const [dashboardId, widgets] of Object.entries(updatedWidgets)) {
          updatedWidgets[dashboardId] = widgets.map((widget) =>
            widget.id === binding.widgetId
              ? {
                  ...widget,
                  selections: [...(widget.selections || []), binding],
                }
              : widget
          );
        }

        return {
          ...state,
          widgets: updatedWidgets,
        };
      }
    ),

    on(WidgetsActions.createWidgetFilterBindingFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    on(
      WidgetsActions.updateWidgetFilterBindingSuccess,
      (state, { binding }) => {
        const updatedWidgets = { ...state.widgets };

        for (const [dashboardId, widgets] of Object.entries(updatedWidgets)) {
          updatedWidgets[dashboardId] = widgets.map((widget) =>
            widget.id === binding.widgetId
              ? {
                  ...widget,
                  selections: (widget.selections || []).map((b) =>
                    b.id === binding.id ? binding : b
                  ),
                }
              : widget
          );
        }

        return {
          ...state,
          widgets: updatedWidgets,
        };
      }
    ),

    on(WidgetsActions.updateWidgetFilterBindingFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    on(WidgetsActions.deleteWidgetFilterBindingSuccess, (state, { id }) => {
      const updatedWidgets = { ...state.widgets };

      for (const [dashboardId, widgets] of Object.entries(updatedWidgets)) {
        updatedWidgets[dashboardId] = widgets.map((widget) => ({
          ...widget,
          selections: (widget.selections || []).filter((b) => b.id !== id),
        }));
      }

      return {
        ...state,
        widgets: updatedWidgets,
      };
    }),

    on(WidgetsActions.deleteWidgetFilterBindingFailure, (state, { error }) => ({
      ...state,
      error,
    }))
  ),
});
