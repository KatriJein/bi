import { createAction, props } from '@ngrx/store';
import { ConnectionDto, DatabaseType } from './connections.feature';

export const loadConnections = createAction('[Connections] Load Connections');

export const loadConnectionsSuccess = createAction(
  '[Connections] Load Connections Success',
  props<{ connections: ConnectionDto[] }>()
);

export const loadConnectionsFailure = createAction(
  '[Connections] Load Connections Failure',
  props<{ error: string }>()
);

export const addConnection = createAction(
  '[Connections] Add Connection',
  props<{ connection: Omit<ConnectionDto, 'id'> }>()
);

export const addConnectionSuccess = createAction(
  '[Connections] Add Connection Success',
  props<{ connection: ConnectionDto }>()
);

export const addConnectionFailure = createAction(
  '[Connections] Add Connection Failure',
  props<{ error: string }>()
);

export const updateConnection = createAction(
  '[Connections] Update Connection',
  props<{ id: string; changes: Partial<ConnectionDto> }>()
);

export const updateConnectionSuccess = createAction(
  '[Connections] Update Connection Success',
  props<{ connection: ConnectionDto }>()
);

export const updateConnectionFailure = createAction(
  '[Connections] Update Connection Failure',
  props<{ error: string }>()
);

export const deleteConnection = createAction(
  '[Connections] Delete Connection',
  props<{ id: string }>()
);

export const deleteConnectionSuccess = createAction(
  '[Connections] Delete Connection Success',
  props<{ id: string }>()
);

export const deleteConnectionFailure = createAction(
  '[Connections] Delete Connection Failure',
  props<{ error: string }>()
);

export const testConnection = createAction(
  '[Connections] Test Connection',
  props<{ connection: ConnectionDto }>()
);

export const testConnectionComplete = createAction(
  '[Connections] Test Connection Complete',
  props<{ result: boolean; connectionId?: string }>()
);
