import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
}
