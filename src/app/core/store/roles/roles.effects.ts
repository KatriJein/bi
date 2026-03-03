import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as RolesActions from './roles.actions';
import { RolesService } from '../../api/services/roles.service';

@Injectable()
export class RolesEffects {
  private actions$ = inject(Actions);
  private rolesService = inject(RolesService);

  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRoles),
      switchMap(() =>
        this.rolesService.loadRoles().pipe(
          map((roles) => RolesActions.loadRolesSuccess({ roles })),
          catchError((error) =>
            of(
              RolesActions.loadRolesFailure({
                error: error.message || 'Failed to load roles',
              })
            )
          )
        )
      )
    )
  );

  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.createRole),
      switchMap(({ name, permissions }) =>
        this.rolesService.createRole(name, permissions).pipe(
          map(() => RolesActions.createRoleSuccess()),
          catchError(error =>
            of(RolesActions.createRoleFailure({ error: error.message || 'Create failed' }))
          )
        )
      )
    )
  );

  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.updateRole),
      switchMap(({ id, name, permissions }) =>
        this.rolesService.updateRole(id, name, permissions).pipe(
          map(() => RolesActions.updateRoleSuccess()),
          catchError(error =>
            of(RolesActions.updateRoleFailure({ error: error.message || 'Update failed' }))
          )
        )
      )
    )
  );

  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.deleteRole),
      switchMap(({ id }) =>
        this.rolesService.deleteRole(id).pipe(
          map(() => RolesActions.deleteRoleSuccess()),
          catchError(error =>
            of(RolesActions.deleteRoleFailure({ error: error.message || 'Delete failed' }))
          )
        )
      )
    )
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        RolesActions.createRoleSuccess,
        RolesActions.updateRoleSuccess,
        RolesActions.deleteRoleSuccess
      ),
      map(() => RolesActions.loadRoles())
    )
  );

  showErrorOnFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          RolesActions.createRoleFailure,
          RolesActions.updateRoleFailure,
          RolesActions.deleteRoleFailure
        ),
        tap(action => {
          console.error('Role operation failed:', action.error);
        })
      ),
    { dispatch: false }
  );
}
