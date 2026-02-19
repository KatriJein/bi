import { createAction, props } from '@ngrx/store';
import { UserDto } from '../user';

export const loadUsers = createAction('[Users] Load Users');
export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: UserDto[] }>()
);
export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>()
);

export const createUserWithRole = createAction(
  '[Users] Create User With Role',
  props<{ name: string; password: string | null; roleId: string }>()
);
export const createUserWithRoleSuccess = createAction('[Users] Create User With Role Success');
export const createUserWithRoleFailure = createAction(
  '[Users] Create User With Role Failure',
  props<{ error: string }>()
);

export const deleteUserWithRole = createAction(
  '[Users] Delete User With Role',
  props<{ userId: string; roleId: string }>()
);
export const deleteUserWithRoleSuccess = createAction('[Users] Delete User With Role Success');
export const deleteUserWithRoleFailure = createAction(
  '[Users] Delete User With Role Failure',
  props<{ error: string }>()
);

export const updateUser = createAction(
  '[Users] Update User',
  props<{ id: string; name?: string | null; password?: string | null }>()
);
export const updateUserSuccess = createAction('[Users] Update User Success');
export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: string }>()
);

export const updateUserRole = createAction(
  '[Users] Update User Role',
  props<{ userId: string; oldRoleId: string; newRoleId: string }>()
);
export const updateUserRoleSuccess = createAction('[Users] Update User Role Success');
export const updateUserRoleFailure = createAction(
  '[Users] Update User Role Failure',
  props<{ error: string }>()
);

export const createUserInterface = createAction(
  '[Users] Create User Interface',
  props<{ userId: string; interfaceId: string; order?: number }>()
);
export const createUserInterfaceSuccess = createAction('[Users] Create User Interface Success');
export const createUserInterfaceFailure = createAction(
  '[Users] Create User Interface Failure',
  props<{ error: string }>()
);

export const deleteUserInterface = createAction(
  '[Users] Delete User Interface',
  props<{ userId: string; interfaceId: string; order: number }>()
);
export const deleteUserInterfaceSuccess = createAction('[Users] Delete User Interface Success');
export const deleteUserInterfaceFailure = createAction(
  '[Users] Delete User Interface Failure',
  props<{ error: string }>()
);

export const updateUserInterface = createAction(
  '[Users] Update User Interface',
  props<{
    userId: string;
    currentInterfaceId: string;
    currentOrder: number;
    newInterfaceId?: string;
    newOrder?: number;
  }>()
);
export const updateUserInterfaceSuccess = createAction('[Users] Update User Interface Success');
export const updateUserInterfaceFailure = createAction(
  '[Users] Update User Interface Failure',
  props<{ error: string }>()
);


export const clearUsers = createAction('[Users] Clear Users');
