import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InterfacesFeature, InterfacesState } from './interfaces.feature';

export const {
  selectInterfaces,
  selectActiveInterfaceId,
  selectAllInterfaces,
  selectIsLoading,
  selectError,
  selectLoaded,
} = InterfacesFeature;

const selectInterfacesState =
  createFeatureSelector<InterfacesState>('interfaces');

export const selectActiveInterface = createSelector(
  selectInterfacesState,
  (state) =>
    state.activeInterfaceId
      ? state.interfaces.find((item) => item.id === state.activeInterfaceId)
      : null,
);
