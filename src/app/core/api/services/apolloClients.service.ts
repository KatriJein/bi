import { Injectable } from '@angular/core';
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { Connection } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ApolloClientsService {
  private clients = new Map<string, ApolloClient<NormalizedCacheObject>>();
  // private mainConnectionId: string | null = null;

  constructor(private httpLink: HttpLink) {}

  createClient(connection: Connection): ApolloClient<NormalizedCacheObject> {
    const uri = connection.getConnectionString();
    const link = this.httpLink.create({ uri });

    const client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });

    this.clients.set(connection.id!, client);
    return client;
  }

  getClient(id: string): ApolloClient<NormalizedCacheObject> | undefined {
    return this.clients.get(id);
  }

  hasClient(id: string): boolean {
    return this.clients.has(id);
  }

  // setMainConnection(id: string): void {
  //   if (!this.clients.has(id)) {
  //     throw new Error(`Client with id "${id}" does not exist`);
  //   }
  //   this.mainConnectionId = id;
  // }

  // getMainClient(): ApolloClient<NormalizedCacheObject> {
  //   if (!this.mainConnectionId) {
  //     throw new Error('Main connection is not set');
  //   }

  //   const client = this.clients.get(this.mainConnectionId);
  //   if (!client) {
  //     throw new Error(
  //       `Main client with id "${this.mainConnectionId}" not found`
  //     );
  //   }

  //   return client;
  // }

  // initializeMainClient(connection: Connection): void {
  //   this.createClient(connection);
  //   this.setMainConnection(connection.id!);
  // }

  // getMainConnectionId(): string | null {
  //   return this.mainConnectionId;
  // }
}
