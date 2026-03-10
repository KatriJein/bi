import { ActionReducer, MetaReducer } from '@ngrx/store';
import { UserActions } from './user';

export function logoutAndClearState(
  reducer: ActionReducer<any>,
): ActionReducer<any> {
  return (state, action) => {
    if (action.type === UserActions.logout.type) {
      return reducer(undefined, action);
    }
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer[] = [logoutAndClearState];
