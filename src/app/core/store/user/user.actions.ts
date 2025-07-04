import { createAction, props } from '@ngrx/store';
import { UserDto } from './user.feature';

export const login = createAction(
  '[User] Login',
  props<{ name: string; password: string }>()
);

export const loginSuccess = createAction(
  '[User] Login Success',
  props<{ user: UserDto }>()
);

export const loginFailure = createAction(
  '[User] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[User] Logout');

