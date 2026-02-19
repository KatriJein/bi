import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as UsersActions from './users.actions';
import { UsersService } from '../../api/services/users.service';
import { Store } from '@ngrx/store';
import { RolesFeature } from '../roles/roles.feature';
import { InterfaceDto, InterfacesFeature } from '../interfaces/interfaces.feature';
import { RoleDto, UserDto } from '../user';

@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private usersService = inject(UsersService);
  private store = inject(Store);

  // === ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ ===
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      withLatestFrom(
        this.store.select(RolesFeature.selectRoles),
        this.store.select(InterfacesFeature.selectInterfaces)
      ),
      switchMap(([, roles, interfaces]) =>

        this.usersService.getUsers().pipe(
          map(rawUsers => {
            const normalized = rawUsers.map(user => {
              const role = roles?.find(r => r.id === user.roleId) || null;
              const userInterfaces = (user.interfaceIds || [])
                .map(id => interfaces.find(i => i.id === id) || null)
                .filter(Boolean) as any[];
              return { ...user, role, interfaces: userInterfaces };
            });
            return UsersActions.loadUsersSuccess({ users: normalized as UserDto[] });
          }),
          catchError(err =>
            of(UsersActions.loadUsersFailure({ error: err.message || 'Failed to load users' }))
          )
        )
      )
    )
  );

  // === СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ С РОЛЬЮ ===
  createUserWithRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUserWithRole),
      switchMap(({ name, password, roleId }) =>
        this.usersService.createUserWithRole(name, password, roleId).pipe(
          map(() => UsersActions.createUserWithRoleSuccess()),
          catchError(err =>
            of(UsersActions.createUserWithRoleFailure({ error: err.message || 'Create failed' }))
          )
        )
      )
    )
  );

  // === УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ С РОЛЬЮ ===
  deleteUserWithRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUserWithRole),
      switchMap(({ userId, roleId }) =>
        this.usersService.deleteUserWithRole(userId, roleId).pipe(
          map(() => UsersActions.deleteUserWithRoleSuccess()),
          catchError(err =>
            of(UsersActions.deleteUserWithRoleFailure({ error: err.message || 'Delete failed' }))
          )
        )
      )
    )
  );

  // === ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ===
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ id, name, password }) =>
        this.usersService.updateUser(id, name, password).pipe(
          map(() => UsersActions.updateUserSuccess()),
          catchError(err =>
            of(UsersActions.updateUserFailure({ error: err.message || 'Update failed' }))
          )
        )
      )
    )
  );

  // === ОБНОВЛЕНИЕ РОЛИ ПОЛЬЗОВАТЕЛЯ ===
  updateUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUserRole),
      switchMap(({ userId, oldRoleId, newRoleId }) =>
        this.usersService.updateUserRole(userId, oldRoleId, newRoleId).pipe(
          map(() => UsersActions.updateUserRoleSuccess()),
          catchError(err =>
            of(UsersActions.updateUserRoleFailure({ error: err.message || 'Role update failed' }))
          )
        )
      )
    )
  );

  // === ИНТЕРФЕЙСЫ ===
  createUserInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUserInterface),
      switchMap(({ userId, interfaceId, order }) =>
        this.usersService.createUserInterface(userId, interfaceId, order).pipe(
          map(() => UsersActions.createUserInterfaceSuccess()),
          catchError(err =>
            of(UsersActions.createUserInterfaceFailure({ error: err.message || 'Interface create failed' }))
          )
        )
      )
    )
  );

  deleteUserInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUserInterface),
      switchMap(({ userId, interfaceId, order }) =>
        this.usersService.deleteUserInterface(userId, interfaceId, order).pipe(
          map(() => UsersActions.deleteUserInterfaceSuccess()),
          catchError(err =>
            of(UsersActions.deleteUserInterfaceFailure({ error: err.message || 'Interface delete failed' }))
          )
        )
      )
    )
  );

  updateUserInterface$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUserInterface),
      switchMap(({ userId, currentInterfaceId, currentOrder, newInterfaceId, newOrder }) =>
        this.usersService.updateUserInterface(
          userId,
          currentInterfaceId,
          currentOrder,
          newInterfaceId,
          newOrder
        ).pipe(
          map(() => UsersActions.updateUserInterfaceSuccess()),
          catchError(err =>
            of(UsersActions.updateUserInterfaceFailure({ error: err.message || 'Interface update failed' }))
          )
        )
      )
    )
  );

  // === ПЕРЕЗАГРУЗКА СПИСКА ПОСЛЕ ЛЮБОЙ МУТАЦИИ ===
  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.createUserWithRoleSuccess,
        UsersActions.deleteUserWithRoleSuccess,
        UsersActions.updateUserSuccess,
        UsersActions.updateUserRoleSuccess,
        UsersActions.createUserInterfaceSuccess,
        UsersActions.deleteUserInterfaceSuccess,
        UsersActions.updateUserInterfaceSuccess
      ),
      map(() => UsersActions.loadUsers())
    )
  );
}
