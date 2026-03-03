import { createFeature, createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { InterfaceDto } from '../interfaces';

export interface RoleDto {
  id: string;
  name: string;
  permissions: Permission[];
}

export type Permission =
  | 'full_access'          
  | 'roles.manage'
  | 'users.manage'
  | 'interfaces.manage'
  | 'datasets.manage'
  | 'charts.manage'
  | 'dashboards.manage'
  | 'dashboard_filters.manage';

export interface UserDto {
  id: string | undefined;
  name: string | undefined;
  role: RoleDto | null;
  interfaces?: InterfaceDto[] | null;
  password?: string | null;
}

export interface UserState {
  user: UserDto | null;
  isLoading: boolean;
  isChecking: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const initialState: UserState = {
  user: null,
  isLoading: false,
  isChecking: false,
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
      isAuthenticated: false,
      isChecking: true,
      error: null,
    })),
    on(UserActions.loginSuccess, (state, { user }) => ({
      ...state,
      user: user,
      isLoading: false,
      isAuthenticated: true,
      isChecking: false,
      error: null,
    })),
    on(UserActions.loginFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
      isChecking: false,
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
