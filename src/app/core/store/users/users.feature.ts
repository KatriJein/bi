import { createFeature, createReducer, on } from '@ngrx/store';
import * as UsersActions from './users.actions';
import { UserDto } from '../user';

export interface UsersState {
  users: UserDto[] | null;
  isLoading: boolean;
  error: string | null;
  loaded: boolean
}

export const initialState: UsersState = {
  users: null,
  isLoading: false,
  error: null,
  loaded: false
};

export const UsersFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialState,

    // Загрузка
    on(UsersActions.loadUsers, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.loadUsersSuccess, (state, { users }) => ({
      ...state,
      users,
      isLoading: false,
      error: null,
      loaded: true,
    })),
    on(UsersActions.loadUsersFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Загрузка интерфейсов
    on(UsersActions.loadUserInterfaces, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      UsersActions.loadUserInterfacesSuccess,
      (state, { userId, interfaces }) => {
        if (!state.users) return state;

        const updatedUsers = state.users.map((user) =>
          user.id === userId ? { ...user, interfaces } : user,
        );

        return {
          ...state,
          users: updatedUsers,
          isLoading: false,
        };
      },
    ),
    on(UsersActions.loadUserInterfacesFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Создание
    on(UsersActions.createUserWithRole, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.createUserWithRoleSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    // Удаление
    on(UsersActions.deleteUserWithRole, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.deleteUserWithRoleSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    // Обновление пользователя
    on(UsersActions.updateUser, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.updateUserSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    // Обновление роли
    on(UsersActions.updateUserRole, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.updateUserRoleSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    // Интерфейсы
    on(UsersActions.createUserInterface, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.createUserInterfaceSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    on(UsersActions.deleteUserInterface, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.deleteUserInterfaceSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    on(UsersActions.updateUserInterface, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UsersActions.updateUserInterfaceSuccess, (state) => ({
      ...state,
      isLoading: false,
    })),

    // Ошибки
    on(
      UsersActions.createUserWithRoleFailure,
      UsersActions.deleteUserWithRoleFailure,
      UsersActions.updateUserFailure,
      UsersActions.updateUserRoleFailure,
      UsersActions.createUserInterfaceFailure,
      UsersActions.deleteUserInterfaceFailure,
      UsersActions.updateUserInterfaceFailure,
      (state, { error }) => ({ ...state, isLoading: false, error }),
    ),

    // Очистка
    on(UsersActions.clearUsers, () => ({ ...initialState, users: null })),
  ),
});
