import { createAction, props } from '@ngrx/store';
import { Permission, RoleDto } from '../user';

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

// Создание
export const createRole = createAction(
  '[Roles] Create Role',
  props<{ name: string; permissions: Permission[] }>()
);
export const createRoleSuccess = createAction('[Roles] Create Role Success');
export const createRoleFailure = createAction(
  '[Roles] Create Role Failure',
  props<{ error: string }>()
);

// Обновление
export const updateRole = createAction(
  '[Roles] Update Role',
  props<{ id: string; name: string; permissions: Permission[] }>()
);
export const updateRoleSuccess = createAction('[Roles] Update Role Success');
export const updateRoleFailure = createAction(
  '[Roles] Update Role Failure',
  props<{ error: string }>()
);

// Удаление
export const deleteRole = createAction(
  '[Roles] Delete Role',
  props<{ id: string }>()
);
export const deleteRoleSuccess = createAction('[Roles] Delete Role Success');
export const deleteRoleFailure = createAction(
  '[Roles] Delete Role Failure',
  props<{ error: string }>()
);

// Очистка ролей
export const clearRoles = createAction('[Roles] Clear Roles');
