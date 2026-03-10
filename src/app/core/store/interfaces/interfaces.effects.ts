import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { InterfacesActions, InterfacesSelectors } from './index';
import { InterfaceService } from '../../api/services';
import { DashboardsActions } from '../dashboards';
import { Store } from '@ngrx/store';
import { UserSelectors } from '../user';
import { User } from '../../models';
import { sortByOrder } from '../../utils';

@Injectable()
export class InterfacesEffects {
  private actions$ = inject(Actions);
  private interfaceService = inject(InterfaceService);
  private store = inject(Store);

  loadInterfaces$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.loadInterfaces),
      withLatestFrom(this.store.select(UserSelectors.selectUserId)),
      switchMap(([, userId]) =>
        this.interfaceService.loadUserInterfaces(userId || '').pipe(
          switchMap((interfaces) => {
            const dashboardsLoadActions = interfaces
              .filter((intf) => !!intf.id)
              .map((intf) =>
                DashboardsActions.loadDashboards({
                  interfaceId: intf.id || '',
                }),
              );

            return [
              InterfacesActions.loadInterfacesSuccess({ interfaces }),
              ...dashboardsLoadActions,
            ];
          }),
          catchError((error) => {
            console.error('[Effect] Ошибка при загрузке интерфейсов:', error);
            return of(
              InterfacesActions.loadInterfacesFailure({
                error:
                  error.message || 'Unknown error while loading interfaces',
              }),
            );
          }),
        ),
      ),
    ),
  );

  loadAllInterfaces$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.loadAllInterfaces),
      exhaustMap(() =>
        this.interfaceService.loadAllInterfaces().pipe(
          switchMap((interfaces) => {
            const dashboardsLoadActions = interfaces
              .filter((intf) => !!intf.id)
              .map((intf) =>
                DashboardsActions.loadDashboards({ interfaceId: intf.id! }),
              );

            return [
              InterfacesActions.loadAllInterfacesSuccess({ interfaces }),
              ...dashboardsLoadActions,
            ];
          }),
          catchError((error) =>
            of(
              InterfacesActions.loadAllInterfacesFailure({
                error: error.message || 'Failed to load all interfaces',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  createInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.createInterface),
      withLatestFrom(this.store.select(UserSelectors.selectUserId)),
      mergeMap(([{ name, order }, userId]) => {
        if (!userId) {
          return of(
            InterfacesActions.createInterfaceFailure({
              error: 'User ID not found',
            }),
          );
        }

        return this.interfaceService.createInterface(name, userId, order).pipe(
          map((newInterface) =>
            InterfacesActions.createInterfaceSuccess({
              interface: newInterface,
            }),
          ),
          catchError((error) =>
            of(
              InterfacesActions.createInterfaceFailure({
                error: error.message,
              }),
            ),
          ),
        );
      }),
    ),
  );

  deleteInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.deleteInterface),
      withLatestFrom(this.store.select(UserSelectors.selectUserId)),
      mergeMap(([{ interfaceId, order }, userId]) => {
        if (!userId) {
          return of(
            InterfacesActions.deleteInterfaceFailure({
              error: 'User ID not found',
            }),
          );
        }

        return this.interfaceService
          .deleteInterface(interfaceId, userId, order)
          .pipe(
            map((id) => InterfacesActions.deleteInterfaceSuccess({ id })),
            catchError((error) =>
              of(
                InterfacesActions.deleteInterfaceFailure({
                  error: error.message || 'Unknown error',
                }),
              ),
            ),
          );
      }),
    ),
  );

  updateInterfaceOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.updateInterfaceOrder),
      withLatestFrom(this.store.select(UserSelectors.selectUserId)),
      mergeMap(([{ interfaceId, order, newOrder }, userId]) => {
        if (!userId) {
          return of(
            InterfacesActions.updateInterfaceOrderFailure({
              error: 'User ID not found',
            }),
          );
        }

        return this.interfaceService
          .updateInterfaceOrder(interfaceId, order, userId, newOrder)
          .pipe(
            map(({ id, order: updatedOrder }) =>
              InterfacesActions.updateInterfaceOrderSuccess({
                interface: { id, order: updatedOrder },
              }),
            ),
            catchError((error) =>
              of(
                InterfacesActions.updateInterfaceOrderFailure({
                  error: error.message || 'Failed to update interface order',
                }),
              ),
            ),
          );
      }),
    ),
  );

  updateInterfaceName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.updateInterfaceName),
      mergeMap(({ id, name }) =>
        this.interfaceService.updateInterfaceName(id, name).pipe(
          mergeMap((updatedInterface) => [
            InterfacesActions.updateInterfaceNameSuccess({
              interface: updatedInterface,
            }),
            InterfacesActions.loadInterfaces(),
          ]),
          catchError((error) =>
            of(
              InterfacesActions.updateInterfaceNameFailure({
                error: error.message || 'Failed to update interface name',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  syncActiveInterfaceWithLocalStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          InterfacesActions.setActiveInterface,
          InterfacesActions.deleteInterfaceSuccess,
          InterfacesActions.createInterfaceSuccess,
        ),
        withLatestFrom(
          this.store.select(InterfacesSelectors.selectActiveInterfaceId),
        ),
        tap(([_, activeInterfaceId]) => {
          if (activeInterfaceId) {
            localStorage.setItem('activeInterfaceId', activeInterfaceId);
          } else {
            localStorage.removeItem('activeInterfaceId');
          }
        }),
      ),
    { dispatch: false },
  );

  ensureActiveInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterfacesActions.loadInterfacesSuccess),
      withLatestFrom(
        this.store.select(InterfacesSelectors.selectAllInterfaces),
      ),
      map(([{ interfaces }]) => {
        const savedId = localStorage.getItem('activeInterfaceId');
        const exists = interfaces.find((i) => i.id === savedId);

        return InterfacesActions.setActiveInterface({
          id: exists?.id || sortByOrder(interfaces)[0]?.id || '',
        });
      }),
    ),
  );
}
