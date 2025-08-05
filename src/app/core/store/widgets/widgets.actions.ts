import { createAction, props } from '@ngrx/store';
import { UpdateWidgetFilterBindingVariables, Widget, WidgetFilterBinding } from '../../api/graphql/types';

// Загрузка
export const loadWidgets = createAction(
  '[Widgets] Load Widgets',
  props<{ dashboardId: string }>()
);

export const loadWidgetsSuccess = createAction(
  '[Widgets] Load Widgets Success',
  props<{ dashboardId: string; widgets: Widget[] }>()
);

export const loadWidgetsFailure = createAction(
  '[Widgets] Load Widgets Failure',
  props<{ error: string }>()
);

// Добавление
export const createWidget = createAction(
  '[Widgets] Create Widget',
  props<{ widget: Omit<Widget, 'id'> }>()
);

export const createWidgetSuccess = createAction(
  '[Widgets] Create Widget Success',
  props<{ dashboardId: string; widget: Widget }>()
);

export const createWidgetFailure = createAction(
  '[Widgets] Create Widget Failure',
  props<{ error: string }>()
);

// Обновление
export const updateWidget = createAction(
  '[Widgets] Update Widget',
  props<{ widgetId: string; patch: Partial<Widget> }>()
);

export const updateWidgetSuccess = createAction(
  '[Widgets] Update Widget Success',
  props<{ dashboardId: string; widget: Widget }>()
);

export const updateWidgetFailure = createAction(
  '[Widgets] Update Widget Failure',
  props<{ error: string }>()
);

// Удаление
export const deleteWidget = createAction(
  '[Widgets] Delete Widget',
  props<{ dashboardId: string; widgetId: string }>()
);

export const deleteWidgetSuccess = createAction(
  '[Widgets] Delete Widget Success',
  props<{ dashboardId: string; widgetId: string }>()
);

export const deleteWidgetFailure = createAction(
  '[Widgets] Delete Widget Failure',
  props<{ error: string }>()
);

// Фильтры
// Загрузка
export const loadWidgetFilterBindings = createAction(
  '[Widgets] Load Widget Filter Bindings'
);

export const loadWidgetFilterBindingsSuccess = createAction(
  '[Widgets] Load Widget Filter Bindings Success',
  props<{ bindings: WidgetFilterBinding[] }>()
);

export const loadWidgetFilterBindingsFailure = createAction(
  '[Widgets] Load Widget Filter Bindings Failure',
  props<{ error: string }>()
);

// Добавление
export const createWidgetFilterBinding = createAction(
  '[Widgets] Create Widget Filter Binding',
  props<{ binding: { widgetId: string; dashboardFilterId: string; chartFilterId: string } }>()
);

export const createWidgetFilterBindingSuccess = createAction(
  '[Widgets] Create Widget Filter Binding Success',
  props<{ binding: WidgetFilterBinding }>()
);

export const createWidgetFilterBindingFailure = createAction(
  '[Widgets] Create Widget Filter Binding Failure',
  props<{ error: string }>()
);

// Обновление
export const updateWidgetFilterBinding = createAction(
  '[Widgets] Update Widget Filter Binding',
  props<{ id: string; patch: UpdateWidgetFilterBindingVariables['patch'] }>()
);

export const updateWidgetFilterBindingSuccess = createAction(
  '[Widgets] Update Widget Filter Binding Success',
  props<{ binding: WidgetFilterBinding }>()
);

export const updateWidgetFilterBindingFailure = createAction(
  '[Widgets] Update Widget Filter Binding Failure',
  props<{ error: string }>()
);

// Удаление
export const deleteWidgetFilterBinding = createAction(
  '[Widgets] Delete Widget Filter Binding',
  props<{ id: string }>()
);

export const deleteWidgetFilterBindingSuccess = createAction(
  '[Widgets] Delete Widget Filter Binding Success',
  props<{ id: string }>()
);

export const deleteWidgetFilterBindingFailure = createAction(
  '[Widgets] Delete Widget Filter Binding Failure',
  props<{ error: string }>()
);
