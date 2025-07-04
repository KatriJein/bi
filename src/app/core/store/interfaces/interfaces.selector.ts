import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InterfacesState } from './interfaces.feature';

const selectInterfacesState =
  createFeatureSelector<InterfacesState>('interfaces');

export const selectAllInterfaces = createSelector(
  selectInterfacesState,
  (state) => state.interfaces
);

export const selectActiveInterfaceId = createSelector(
  selectInterfacesState,
  (state) => state.activeInterfaceId
);

export const selectActiveInterface = createSelector(
  selectInterfacesState,
  (state) =>
    state.activeInterfaceId
      ? state.interfaces.find((item) => item.id === state.activeInterfaceId)
      : null
);


export const selectInterfacesLoading = createSelector(
  selectInterfacesState,
  (state) => state.isLoading
);

export const selectInterfacesError = createSelector(
  selectInterfacesState,
  (state) => state.error
);
