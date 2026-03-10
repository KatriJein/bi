import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, race } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import * as UsersActions from './users.actions';
import { UsersService } from '../../api/services/users.service';
import { Store } from '@ngrx/store';
import { RolesFeature } from '../roles/roles.feature';
import {
  InterfaceDto,
  InterfacesFeature,
} from '../interfaces/interfaces.feature';
import { RoleDto, UserDto } from '../user';
import { RolesActions } from '../roles';

@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private usersService = inject(UsersService);
  private store = inject(Store);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      exhaustMap(() =>
        race(
          this.store.select(RolesFeature.selectLoaded).pipe(
            filter((loaded) => loaded),
            take(1),
            switchMap(() =>
              this.store.select(RolesFeature.selectRoles).pipe(take(1)),
            ),
          ),
          this.actions$.pipe(
            ofType(RolesActions.loadRolesFailure),
            take(1),
            map(() => null as RoleDto[] | null),
          ),
        ).pipe(
          switchMap((roles) =>
            this.usersService.getUsers().pipe(
              map((rawUsers) => {
                const usersWithRoles = rawUsers.map((user) => ({
                  ...user,
                  role: roles?.find((r) => r.id === user.roleId) || null,
                }));
                return UsersActions.loadUsersSuccess({ users: usersWithRoles });
              }),
              catchError((err) =>
                of(UsersActions.loadUsersFailure({ error: err.message })),
              ),
            ),
          ),
        ),
      ),
    ),
  );

  loadUserInterfaces$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUserInterfaces),
      switchMap(({ userId }) =>
        this.usersService.loadUserInterfaces(userId).pipe(
          map((interfaces) =>
            UsersActions.loadUserInterfacesSuccess({ userId, interfaces }),
          ),
          catchError((error) =>
            of(
              UsersActions.loadUserInterfacesFailure({
                error: error.message || 'Failed to load user interfaces',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  createUserWithRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUserWithRole),
      switchMap(({ name, password, roleId }) =>
        this.usersService.createUserWithRole(name, password, roleId).pipe(
          map(() => UsersActions.createUserWithRoleSuccess()),
          catchError((err) =>
            of(
              UsersActions.createUserWithRoleFailure({
                error: err.message || 'Create failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  deleteUserWithRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUserWithRole),
      switchMap(({ userId, roleId }) =>
        this.usersService.deleteUserWithRole(userId, roleId).pipe(
          map(() => UsersActions.deleteUserWithRoleSuccess()),
          catchError((err) =>
            of(
              UsersActions.deleteUserWithRoleFailure({
                error: err.message || 'Delete failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ id, name, password }) =>
        this.usersService.updateUser(id, name, password).pipe(
          map(() => UsersActions.updateUserSuccess()),
          catchError((err) =>
            of(
              UsersActions.updateUserFailure({
                error: err.message || 'Update failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUserRole),
      switchMap(({ userId, oldRoleId, newRoleId }) =>
        this.usersService.updateUserRole(userId, oldRoleId, newRoleId).pipe(
          map(() => UsersActions.updateUserRoleSuccess()),
          catchError((err) =>
            of(
              UsersActions.updateUserRoleFailure({
                error: err.message || 'Role update failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  createUserInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUserInterface),
      switchMap(({ userId, interfaceId, order }) =>
        this.usersService.createUserInterface(userId, interfaceId, order).pipe(
          map(() => UsersActions.createUserInterfaceSuccess()),
          catchError((err) =>
            of(
              UsersActions.createUserInterfaceFailure({
                error: err.message || 'Interface create failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  deleteUserInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUserInterface),
      switchMap(({ userId, interfaceId, order }) =>
        this.usersService.deleteUserInterface(userId, interfaceId, order).pipe(
          map(() => UsersActions.deleteUserInterfaceSuccess()),
          catchError((err) =>
            of(
              UsersActions.deleteUserInterfaceFailure({
                error: err.message || 'Interface delete failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateUserInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUserInterface),
      switchMap(
        ({
          userId,
          currentInterfaceId,
          currentOrder,
          newInterfaceId,
          newOrder,
        }) =>
          this.usersService
            .updateUserInterface(
              userId,
              currentInterfaceId,
              currentOrder,
              newInterfaceId,
              newOrder,
            )
            .pipe(
              map(() => UsersActions.updateUserInterfaceSuccess()),
              catchError((err) =>
                of(
                  UsersActions.updateUserInterfaceFailure({
                    error: err.message || 'Interface update failed',
                  }),
                ),
              ),
            ),
      ),
    ),
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.createUserWithRoleSuccess,
        UsersActions.deleteUserWithRoleSuccess,
        UsersActions.updateUserSuccess,
        UsersActions.updateUserRoleSuccess,
        UsersActions.createUserInterfaceSuccess,
        UsersActions.deleteUserInterfaceSuccess,
        UsersActions.updateUserInterfaceSuccess,
      ),
      map(() => UsersActions.loadUsers()),
    ),
  );
}
