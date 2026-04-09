import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { WidgetFilterBindingService, WidgetService } from '../../api/services';
import * as WidgetsActions from './widgets.actions';
import { Widget, WidgetFilterBinding } from '../../api/graphql/types';
import { Store } from '@ngrx/store';

@Injectable()
export class WidgetsEffects {
  private actions$ = inject(Actions);
  private widgetService = inject(WidgetService);
  private widgetFilterBindingService = inject(WidgetFilterBindingService);
  private store = inject(Store);

  loadWidgets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.loadWidgets),
      mergeMap(({ dashboardId }) =>
        this.widgetService.loadWidgets(dashboardId).pipe(
          map((widgets) =>
            WidgetsActions.loadWidgetsSuccess({ dashboardId, widgets }),
          ),
          catchError((error) =>
            of(WidgetsActions.loadWidgetsFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  createWidget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.createWidget),
      mergeMap(({ widget }) =>
        this.widgetService.createWidget(widget).pipe(
          map((createdWidget) =>
            WidgetsActions.createWidgetSuccess({
              dashboardId: widget.dashboardId!,
              widget: createdWidget,
            }),
          ),
          catchError((error) =>
            of(WidgetsActions.createWidgetFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  updateWidget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.updateWidget),
      mergeMap(({ widgetId, patch }) =>
        this.widgetService.updateWidget(widgetId, patch).pipe(
          map((updatedWidget) =>
            WidgetsActions.updateWidgetSuccess({
              dashboardId: updatedWidget.dashboardId!,
              widget: updatedWidget,
            }),
          ),
          catchError((error) =>
            of(WidgetsActions.updateWidgetFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  deleteWidget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.deleteWidget),
      mergeMap(({ dashboardId, widgetId }) =>
        this.widgetService.deleteWidget(widgetId).pipe(
          map(() =>
            WidgetsActions.deleteWidgetSuccess({ dashboardId, widgetId }),
          ),
          catchError((error) =>
            of(WidgetsActions.deleteWidgetFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  loadWidgetFilterBindings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.loadWidgetsSuccess),
      mergeMap(({ widgets }) =>
        combineLatest(
          widgets.map((widget) =>
            this.widgetFilterBindingService
              .getWidgetFilterBindings({ widgetId: widget.id })
              .pipe(catchError(() => of([] as WidgetFilterBinding[]))),
          ),
        ).pipe(
          map((bindingsArrays) => bindingsArrays.flat()),
          map((bindings) =>
            WidgetsActions.loadWidgetFilterBindingsSuccess({ bindings }),
          ),
        ),
      ),
      catchError((error) =>
        of(
          WidgetsActions.loadWidgetFilterBindingsFailure({
            error: error.message,
          }),
        ),
      ),
    ),
  );

  createWidgetFilterBinding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.createWidgetFilterBinding),
      mergeMap(({ binding }) =>
        this.widgetFilterBindingService.createWidgetFilterBinding(binding).pipe(
          map((created) =>
            WidgetsActions.createWidgetFilterBindingSuccess({
              binding: created,
            }),
          ),
          catchError((error) =>
            of(
              WidgetsActions.createWidgetFilterBindingFailure({
                error: error.message,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateWidgetFilterBinding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.updateWidgetFilterBinding),
      mergeMap(({ id, patch }) =>
        this.widgetFilterBindingService
          .updateWidgetFilterBinding(id, patch)
          .pipe(
            map((updated) =>
              WidgetsActions.updateWidgetFilterBindingSuccess({
                binding: updated,
              }),
            ),
            catchError((error) =>
              of(
                WidgetsActions.updateWidgetFilterBindingFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
      ),
    ),
  );

  deleteWidgetFilterBinding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.deleteWidgetFilterBinding),
      mergeMap(({ id }) =>
        this.widgetFilterBindingService.deleteWidgetFilterBinding(id).pipe(
          map(() => WidgetsActions.deleteWidgetFilterBindingSuccess({ id })),
          catchError((error) =>
            of(
              WidgetsActions.deleteWidgetFilterBindingFailure({
                error: error.message,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadWidget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.loadWidget),
      mergeMap(({ widgetId }) =>
        this.widgetService.getWidgetById(widgetId).pipe(
          filter((w): w is Widget => w !== null),
          mergeMap((widget) => [
            WidgetsActions.loadWidgetSuccess({ widget }),
            WidgetsActions.loadWidgetSelections({ widgetId: widget.id }),
          ]),
          catchError((error) =>
            of(WidgetsActions.loadWidgetFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  loadWidgetSelections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.loadWidgetSelections),
      mergeMap(({ widgetId }) =>
        this.widgetFilterBindingService
          .getWidgetFilterBindings({ widgetId })
          .pipe(
            map((selections) =>
              WidgetsActions.loadWidgetSelectionsSuccess({
                widgetId,
                selections,
              }),
            ),
            catchError((error) =>
              of(
                WidgetsActions.loadWidgetSelectionsFailure({
                  widgetId,
                  error: error.message,
                }),
              ),
            ),
          ),
      ),
    ),
  );
}
