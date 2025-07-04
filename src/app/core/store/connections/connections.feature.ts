import { createFeature, createReducer, on } from '@ngrx/store';
import * as ConnectionsActions from './connections.actions';

export enum DatabaseType {
  PostgreSQL = 'postgresql',
  MySQL = 'mysql',
  GraphQL = 'graphql',
}

export interface ConnectionDto {
  id: string;
  name: string;
  type: DatabaseType;
  config: {
    host: string;
    port: number;
    database: string;
    username?: string;
    password?: string;
  };
}

export interface ConnectionsState {
  connections: ConnectionDto[];
  isLoading: boolean;
  error: string | null;
  testingConnectionId: string | null;
}

export const initialState: ConnectionsState = {
  connections: [],
  isLoading: false,
  error: null,
  testingConnectionId: null,
};

export const ConnectionsFeature = createFeature({
  name: 'connections',
  reducer: createReducer(
    initialState,
    // Загрузка
    on(ConnectionsActions.loadConnections, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ConnectionsActions.loadConnectionsSuccess, (state, { connections }) => ({
      ...state,
      connections,
      isLoading: false,
    })),
    on(ConnectionsActions.loadConnectionsFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Добавление подключения
    on(ConnectionsActions.addConnection, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ConnectionsActions.addConnectionSuccess, (state, { connection }) => ({
      ...state,
      connections: [...state.connections, connection],
      isLoading: false,
    })),
    on(ConnectionsActions.addConnectionFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Обновление
    on(ConnectionsActions.updateConnection, (state, { id }) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ConnectionsActions.updateConnectionSuccess, (state, { connection }) => ({
      ...state,
      connections: state.connections.map((c) =>
        c.id === connection.id ? connection : c
      ),
      isLoading: false,
    })),
    on(ConnectionsActions.updateConnectionFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Удаление
    on(ConnectionsActions.deleteConnection, (state, { id }) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(ConnectionsActions.deleteConnectionSuccess, (state, { id }) => ({
      ...state,
      connections: state.connections.filter((c) => c.id !== id),
      isLoading: false,
    })),
    on(ConnectionsActions.deleteConnectionFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Тестирование
    on(ConnectionsActions.testConnection, (state, { connection }) => ({
      ...state,
      testingConnectionId: connection.id,
    })),
    on(ConnectionsActions.testConnectionComplete, (state) => ({
      ...state,
      testingConnectionId: null,
    }))
  ),
});
