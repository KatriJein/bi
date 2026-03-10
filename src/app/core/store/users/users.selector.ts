import { createSelector } from '@ngrx/store';
import { UsersFeature } from './users.feature';
import { RoleDto } from '../user';

export const { selectUsers, selectIsLoading, selectError, selectLoaded } =
  UsersFeature;

export const selectHasUsers = createSelector(
  selectUsers,
  (users) => users !== null && users.length > 0,
);

export const selectUsersCount = createSelector(
  selectUsers,
  (users) => users?.length || 0,
);

export const selectUserInterfaces = (userId: string) =>
  createSelector(
    UsersFeature.selectUsers,
    (users) => users?.find((user) => user.id === userId)?.interfaces || [],
  );

export const selectUserById = (userId: string) =>
  createSelector(
    selectUsers,
    (users) => users?.find((user) => user.id === userId) || null,
  );

export const selectUsersByRoleId = (roleId: string) =>
  createSelector(
    selectUsers,
    (users) => users?.filter((u) => u.role?.id === roleId) || [],
  );

export const selectUniqueUserRoles = createSelector(selectUsers, (users) => {
  if (!users) return [];
  const roleMap = new Map<string, RoleDto>();
  users.forEach((user) => {
    if (user.role) {
      roleMap.set(user.role.id, user.role);
    }
  });
  return Array.from(roleMap.values());
});

export const selectIsLoadingWithDelay = createSelector(
  selectIsLoading,
  selectUsers,
  (isLoading, users) => isLoading && users === null,
);
