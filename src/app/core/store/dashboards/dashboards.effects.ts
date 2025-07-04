import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  delay,
  map,
  mergeMap,
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';
import { DashboardsActions } from './index';
import { DashboardService } from '../../api/services';

@Injectable()
export class DashboardsEffects {
  private actions$ = inject(Actions);
  private dashboardService = inject(DashboardService);

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
      switchMap(({ name, interfaceId, order }) =>
        this.dashboardService.createDashboard(name, interfaceId, order).pipe(
          switchMap((response) => {
            if (!response) {
              throw new Error('Failed to create dashboard');
            }
            const { id } = response;

            return this.dashboardService.loadUserDashboards(interfaceId).pipe(
              skip(1),

              map((dashboards) => {
                const dashboard = dashboards.find((d) => d.id === id);
                if (!dashboard) throw new Error('Created dashboard not found');
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
            );
          }),
          catchError((error) =>
            of(DashboardsActions.addDashboardFailure({ error: error.message }))
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
}
