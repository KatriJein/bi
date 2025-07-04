import { createSelector } from '@ngrx/store';
import { UserDto, UserFeature } from './user.feature';

export const {
  selectUser,
  selectIsLoading,
  selectError,
  selectIsAuthenticated,
} = UserFeature;

export const selectUserRole = createSelector(
  selectUser,
  (user: UserDto | null) => user?.role
);

export const selectUserName = createSelector(
  selectUser,
  (user: UserDto | null) => user?.name
);

export const selectUserId = createSelector(
  selectUser,
  (user: UserDto | null) => user?.id
);
