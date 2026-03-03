import { createFeature, createReducer, on } from '@ngrx/store';
import * as RolesActions from './roles.actions';
import { RoleDto } from '../user';


export interface RolesState {
  roles: RoleDto[] | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: RolesState = {
  roles: null,
  isLoading: false,
  error: null,
};

export const RolesFeature = createFeature({
  name: 'roles',
  reducer: createReducer(
    initialState,

    // Загрузка ролей
    on(RolesActions.loadRoles, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),

    on(RolesActions.loadRolesSuccess, (state, { roles }) => ({
      ...state,
      roles,
      isLoading: false,
      error: null,
    })),

    on(RolesActions.loadRolesFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    on(
      RolesActions.createRole,
      RolesActions.updateRole,
      RolesActions.deleteRole,
      state => ({ ...state, isLoading: true, error: null })
    ),

    on(
      RolesActions.createRoleSuccess,
      RolesActions.updateRoleSuccess,
      RolesActions.deleteRoleSuccess,
      state => ({ ...state, isLoading: false })
    ),

    on(
      RolesActions.createRoleFailure,
      RolesActions.updateRoleFailure,
      RolesActions.deleteRoleFailure,
      (state, { error }) => ({ ...state, isLoading: false, error })
    ),

    // Очистка ролей
    on(RolesActions.clearRoles, () => ({
      ...initialState,
      roles: null,
    }))
  ),
});
