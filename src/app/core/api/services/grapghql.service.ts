import { Injectable, inject } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { DocumentNode } from 'graphql';
import { Observable } from 'rxjs';
import {
  FetchResult,
  InMemoryCache,
  OperationVariables,
} from '@apollo/client/core';
import { Store } from '@ngrx/store';
import { ConnectionsSelectors, DatabaseType } from '../../store/connections';
import { Connection } from '../../models';
import { HttpHeaders } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

const DEFAULT_CONNECTION_ID = 'default';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private readonly defaultApollo = inject(Apollo);
  private readonly defaultHttpLink = inject(HttpLink);

  constructor(
    private readonly apollo: Apollo,
    private readonly httpLink: HttpLink,
    private readonly store: Store
  ) {
    // this.initializeDefaultClient();
  }

  // private initializeDefaultClient(): void {
  //   this.defaultApollo.create({
  //     link: this.defaultHttpLink.create({
  //       uri: 'http://localhost:5000/graphql',
  //     }),
  //     cache: new InMemoryCache(),
  //     defaultOptions: {
  //       watchQuery: {
  //         fetchPolicy: 'cache-and-network',
  //         errorPolicy: 'all',
  //       },
  //       query: {
  //         fetchPolicy: 'network-only',
  //         errorPolicy: 'all',
  //       },
  //       mutate: {
  //         errorPolicy: 'all',
  //       },
  //     },
  //   });
  // }

  initClient(connectionId: string): void {
    if (connectionId === DEFAULT_CONNECTION_ID) return;

    this.store
      .select(ConnectionsSelectors.selectConnectionById(connectionId))
      .subscribe((connection) => {
        if (!connection || connection.type !== DatabaseType.GraphQL) return;

        const connectionInstance = new Connection(connection);
        const headers = this.prepareHeaders(connectionInstance);

        this.apollo.createNamed(connectionId, {
          link: this.httpLink.create({
            uri: connectionInstance.getConnectionString(),
            headers,
          }),
          cache: new InMemoryCache(),
        });
      });
  }

  query<T = any, V extends OperationVariables = OperationVariables>(
    connectionId?: string,
    query?: DocumentNode,
    variables?: V,
    fetchPolicy: 'cache-first' | 'network-only' = 'network-only'
  ): Observable<T> {
    const client = connectionId
      ? this.apollo.use(connectionId)
      : this.defaultApollo;

    return client
      .query<T, V>({
        query: query!,
        variables,
        fetchPolicy,
      })
      .pipe(map((result) => result.data));
  }

  watchQuery<T = any, V extends OperationVariables = OperationVariables>(
    connectionId?: string,
    query?: DocumentNode,
    variables?: V,
    pollInterval?: number
  ): Observable<T> {
    return this.watchQueryRef<T, V>(
      connectionId,
      query,
      variables,
      pollInterval
    ).valueChanges.pipe(map((result) => result.data));
  }

  watchQueryRef<T = any, V extends OperationVariables = OperationVariables>(
    connectionId?: string,
    query?: DocumentNode,
    variables?: V,
    pollInterval?: number
  ): QueryRef<T, V> {
    const client = connectionId
      ? this.apollo.use(connectionId)
      : this.defaultApollo;

    return client.watchQuery<T, V>({
      query: query!,
      variables,
      pollInterval,
      fetchPolicy: 'cache-and-network',
    });
  }

  mutate<T = any, V extends OperationVariables = OperationVariables>(
    connectionId?: string,
    mutation?: DocumentNode,
    variables?: V,
    context?: Record<string, any>
  ): Observable<T> {
    const client = connectionId
      ? this.apollo.use(connectionId)
      : this.defaultApollo;

    return client
      .mutate<T, V>({
        mutation: mutation!,
        variables,
        context,
      })
      .pipe(
        map((result) => result.data),
        filter((data): data is T => data != null)
      );
  }

  subscribe<T = any, V extends OperationVariables = OperationVariables>(
    query: DocumentNode,
    variables?: V,
    connectionId?: string
  ): Observable<T> {
    const client = connectionId
      ? this.apollo.use(connectionId)
      : this.defaultApollo;

    return client
      .subscribe<T, V>({
        query,
        variables,
      })
      .pipe(map((res) => res.data as T));
  }

  async clearCache(connectionId?: string): Promise<void> {
    const client = connectionId
      ? this.apollo.use(connectionId).client
      : this.defaultApollo.client;

    await client.clearStore();
    await client.resetStore();
  }

  private prepareHeaders(connection: Connection): HttpHeaders {
    let headers = new HttpHeaders();

    if (connection.config?.username && connection.config.password) {
      const credentials = `${connection.config.username}:${connection.config.password}`;
      headers = headers.set('Authorization', `Basic ${btoa(credentials)}`);
    }

    return headers;
  }
}
