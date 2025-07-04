import { createFeature, createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';

export interface RoleDto {
  id: string | undefined;
  name: string | undefined;
}

export interface UserDto {
  id: string | undefined;
  name: string | undefined;
  role: RoleDto | undefined;
}

export interface UserState {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const initialState: UserState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const UserFeature = createFeature({
  name: 'user',
  reducer: createReducer(
    initialState,
    // Логин
    on(UserActions.login, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(UserActions.loginSuccess, (state, { user }) => ({
      ...state,
      user: user,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    })),
    on(UserActions.loginFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
      isAuthenticated: false,
    })),

    // Логаут
    on(UserActions.logout, (state) => ({
      ...state,
      user: null,
      isAuthenticated: false,
    }))
  ),
});
