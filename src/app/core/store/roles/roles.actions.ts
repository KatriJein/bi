import { createAction, props } from '@ngrx/store';
import { RoleDto } from '../user';

// Загрузка ролей
export const loadRoles = createAction('[Roles] Load Roles');
export const loadRolesSuccess = createAction(
  '[Roles] Load Roles Success',
  props<{ roles: RoleDto[] }>()
);
export const loadRolesFailure = createAction(
  '[Roles] Load Roles Failure',
  props<{ error: string }>()
);

// Очистка ролей 
export const clearRoles = createAction('[Roles] Clear Roles');
