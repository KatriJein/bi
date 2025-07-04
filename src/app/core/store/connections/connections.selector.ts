import { createSelector } from '@ngrx/store';
import { ConnectionsFeature } from './connections.feature';

export const {
  selectConnections,
  selectIsLoading,
  selectError,
  selectTestingConnectionId,
} = ConnectionsFeature;

export const selectConnectionById = (id: string) =>
  createSelector(selectConnections, (connections) =>
    connections.find((c) => c.id === id)
  );

export const selectConnectionByName = (name: string) =>
  createSelector(selectConnections, (connections) =>
    connections.find((c) => c.name === name)
  );
