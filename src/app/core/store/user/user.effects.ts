import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import * as UserActions from './user.actions';
import { UserService } from '../../api/services';
import { InterfacesActions } from '../interfaces';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),

      switchMap(({ name, password }) =>
        this.userService.getUserByNameAndPassword(name, password).pipe(
          switchMap((user) => {
            if (user && user.id) {
              return [
                UserActions.loginSuccess({ user }),
                InterfacesActions.loadInterfaces(),
              ];
            } else {
              return of(
                UserActions.loginFailure({ error: 'Invalid credentials' })
              );
            }
          }),
          catchError((error) =>
            of(UserActions.loginFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
