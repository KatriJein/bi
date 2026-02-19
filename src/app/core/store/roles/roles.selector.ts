import { createSelector } from '@ngrx/store';
import { RolesFeature } from './roles.feature';

export const { selectRoles, selectIsLoading, selectError } = RolesFeature;

export const selectRoleById = (roleId: string) =>
  createSelector(
    selectRoles,
    (roles) => roles?.find((role) => role.id === roleId) || null,
  );

export const selectIsLoadingWithDelay = createSelector(
  selectIsLoading,
  selectRoles,
  (isLoading, roles) => isLoading && roles === null,
);
