import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DashboardDto, DashboardsActions } from './index';
import { DashboardFiltersService, DashboardService } from '../../api/services';

@Injectable()
export class DashboardsEffects {
  private actions$ = inject(Actions);
  private dashboardService = inject(DashboardService);
  private dashboardFiltersService = inject(DashboardFiltersService);

  loadDashboards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.loadDashboards),
      mergeMap(({ interfaceId }) =>
        this.dashboardService.loadUserDashboards(interfaceId).pipe(
          map((dashboards) =>
            DashboardsActions.loadDashboardsSuccess({ interfaceId, dashboards })
          ),
          catchError((error) =>
            of(DashboardsActions.addDashboardFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.addDashboard),
      switchMap(({ name, parentId, interfaceId, order }) =>
        this.dashboardService
          .createDashboard(name, parentId, interfaceId, order)
          .pipe(
            map((dashboard) => {
              if (!dashboard) {
                throw new Error('Failed to create dashboard');
              }
              return DashboardsActions.addDashboardSuccess({
                interfaceId,
                dashboard,
              });
            }),
            catchError((error) =>
              of(
                DashboardsActions.addDashboardFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );

  removeDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.removeDashboard),
      switchMap(({ dashboardId, interfaceId, order }) =>
        this.dashboardService
          .deleteDashboard(dashboardId, interfaceId, order)
          .pipe(
            map((id) =>
              DashboardsActions.removeDashboardSuccess({ interfaceId, id })
            ),
            catchError((error) =>
              of(
                DashboardsActions.removeDashboardFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );

  updateDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.updateDashboard),
      switchMap(({ id, patch, interfaceId }) =>
        this.dashboardService.updateDashboard(id, patch).pipe(
          mergeMap((updatedDashboard) => {
            if (!updatedDashboard) {
              return [
                DashboardsActions.updateDashboardFailure({
                  error: 'Dashboard update returned null',
                }),
              ];
            }
            return [
              DashboardsActions.updateDashboardSuccess({
                interfaceId,
                dashboard: updatedDashboard,
              }),
              DashboardsActions.loadDashboards({ interfaceId }),
            ];
          }),
          catchError((error) =>
            of(
              DashboardsActions.updateDashboardFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  updateDashboardOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.updateDashboardOrder),
      mergeMap(({ dashboardId, interfaceId, order, newOrder }) =>
        this.dashboardService
          .updateDashboardOrder(dashboardId, interfaceId, order, newOrder)
          .pipe(
            map(({ id, order: updatedOrder }) =>
              DashboardsActions.updateDashboardOrderSuccess({
                dashboardId: id,
                order: updatedOrder,
                interfaceId,
              })
            ),
            catchError((error) =>
              of(
                DashboardsActions.updateDashboardOrderFailure({
                  error: error.message || 'Failed to update dashboard order',
                })
              )
            )
          )
      )
    )
  );

  setActiveDashboard$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DashboardsActions.setActiveDashboard),
        tap(({ id }) => {
          if (id !== null) {
            localStorage.setItem('activeDashboardId', id);
          }
        })
      ),
    { dispatch: false }
  );

  // Фильтры
  loadFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.loadDashboardsSuccess),
      switchMap(() =>
        this.dashboardFiltersService.getDashboardFilters().pipe(
          map((filters) =>
            DashboardsActions.loadDashboardFiltersSuccess({ filters })
          ),
          catchError((error) =>
            of(
              DashboardsActions.loadDashboardFiltersFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  createFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.createDashboardFilter),
      switchMap(({ filter }) =>
        this.dashboardFiltersService.createDashboardFilter(filter).pipe(
          map((created) =>
            DashboardsActions.createDashboardFilterSuccess({
              filter: created,
            })
          ),
          catchError((error) =>
            of(
              DashboardsActions.createDashboardFilterFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  updateFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.updateDashboardFilter),
      switchMap(({ id, patch }) =>
        this.dashboardFiltersService.updateDashboardFilter(id, patch).pipe(
          map((updated) =>
            DashboardsActions.updateDashboardFilterSuccess({
              filter: updated,
            })
          ),
          catchError((error) =>
            of(
              DashboardsActions.updateDashboardFilterFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  deleteFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.deleteDashboardFilter),
      switchMap(({ id }) =>
        this.dashboardFiltersService.deleteDashboardFilter(id).pipe(
          map(() => DashboardsActions.deleteDashboardFilterSuccess({ id })),
          catchError((error) =>
            of(
              DashboardsActions.deleteDashboardFilterFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  // Загрузка фильтров по id
  loadDashboardSelectionsById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.loadDashboardSelections),
      switchMap(({ dashboardId }) =>
        this.dashboardFiltersService.getDashboardFiltersById(dashboardId).pipe(
          map((filters) => {
            return DashboardsActions.loadDashboardSelectionsSuccess({
              dashboardId,
              filters,
            });
          }),
          catchError((error) =>
            of(
              DashboardsActions.loadDashboardSelectionsFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  restoreActiveDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardsActions.loadDashboardsSuccess),
      switchMap(({ interfaceId, dashboards }) => {
        const savedDashboardId = localStorage.getItem('activeDashboardId');
        if (
          savedDashboardId &&
          dashboards.some((d) => d.id === savedDashboardId)
        ) {
          return [
            DashboardsActions.setActiveDashboard({ id: savedDashboardId }),
          ];
        }
        return [];
      })
    )
  );
}
