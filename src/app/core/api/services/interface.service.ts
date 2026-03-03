import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Interface } from '../../models';
import {
  CreateInterfaceType,
  CreateUserInterfaceType,
  DeleteInterfaceResponse,
  DeleteInterfaceVariables,
  DeleteUserInterfaceResponse,
  DeleteUserInterfaceVariables,
  GetInterfacesType,
  GetUserInterfacesType,
  UpdateInterfaceMutationResponse,
  UpdateInterfaceMutationVariables,
  UpdateInterfaceOrderMutationResponse,
  UpdateInterfaceOrderMutationVariables,
} from '../../api/graphql/types';
import { InterfaceDto } from '../../store/interfaces';
import { Injectable, inject } from '@angular/core';
import { getInterfacesQuery, getUserInterfacesQuery } from '../graphql/queries';
import {
  createInterfaceMutation,
  createUserInterfaceMutation,
  deleteInterfaceMutation,
  deleteUserInterfaceMutation,
  updateInterfaceMutation,
  updateInterfaceOrderMutation,
} from '../graphql/mutations';
import { Store } from '@ngrx/store';
import { GraphqlService } from './grapghql.service';

@Injectable({ providedIn: 'root' })
export class InterfaceService {
  store = inject(Store);
  private graphql = inject(GraphqlService);
  constructor() {}

  loadUserInterfaces(userId: string): Observable<InterfaceDto[]> {
    return this.graphql
      .watchQuery<GetUserInterfacesType>(undefined, getUserInterfacesQuery, {
        id: userId,
      })
      .pipe(
        map((response) => this.transformResponse(response)),
        catchError((error) => {
          console.error('Error loading interfaces:', error);
          return of([]);
        })
      );
  }

  loadAllInterfaces(): Observable<InterfaceDto[]> {
    return this.graphql
      .watchQuery<GetInterfacesType>(undefined, getInterfacesQuery)
      .pipe(
        map(response => {
          if (!response?.interfaces?.nodes) return [];
          return response.interfaces.nodes.map(node => ({
            id: node.id,
            name: node.name,
            order: undefined,
          }));
        }),
        catchError(error => {
          console.error('Error loading all interfaces:', error);
          return of([]);
        })
      );
  }

  createInterface(
    name: string,
    userId: string,
    order?: number
  ): Observable<InterfaceDto> {
    return this.graphql
      .mutate<CreateInterfaceType>(undefined, createInterfaceMutation, { name })
      .pipe(
        switchMap((result) => {
          if (!result.createInterface?.interface?.id) {
            throw new Error('Failed to create interface');
          }
          const interfaceId = result.createInterface.interface.id;

          return this.graphql
            .mutate<CreateUserInterfaceType>(
              undefined,
              createUserInterfaceMutation,
              {
                interfaceId,
                userId,
                order: order || 0,
              }
            )
            .pipe(
              map((response) => {
                if (!response.createUserInterface?.userInterface) {
                  throw new Error('Failed to attach interface to user');
                }
                const node = response.createUserInterface.userInterface;
                return {
                  id: node.interface.id,
                  name: node.interface.name,
                  order: node.order,
                };
              })
            );
        }),
        catchError((error) => {
          console.error('Error in createAndAttachInterface:', error);
          throw error;
        })
      );
  }

  deleteInterface(
    interfaceId: string,
    userId: string,
    order?: number
  ): Observable<string> {
    return this.graphql
      .mutate<DeleteUserInterfaceResponse, DeleteUserInterfaceVariables>(
        undefined,
        deleteUserInterfaceMutation,
        { interfaceId, userId, order: order || 0 }
      )
      .pipe(
        switchMap((res) => {
          const deletedId = res.deleteUserInterface?.interface?.id;
          if (!deletedId) {
            throw new Error('UserInterface deletion failed');
          }

          return this.graphql
            .mutate<DeleteInterfaceResponse, DeleteInterfaceVariables>(
              undefined,
              deleteInterfaceMutation,
              { id: deletedId }
            )
            .pipe(
              map((deleteRes) => {
                const id = deleteRes.deleteInterface?.interface?.id;
                if (!id) {
                  throw new Error('Interface deletion failed');
                }
                return id;
              })
            );
        }),
        catchError((error) => {
          console.error('Error in deleteInterface:', error);
          throw error;
        })
      );
  }

  updateInterfaceOrder(
    interfaceId: string,
    order: number,
    userId: string,
    newOrder: number
  ): Observable<{ id: string; order: number }> {
    return this.graphql
      .mutate<
        UpdateInterfaceOrderMutationResponse,
        UpdateInterfaceOrderMutationVariables
      >(undefined, updateInterfaceOrderMutation, {
        interfaceId,
        order,
        userId,
        newOrder,
      })
      .pipe(
        map((response) => {
          const userInterface = response.updateUserInterface?.userInterface;
          if (!userInterface || !userInterface.interface) {
            throw new Error('Failed to update interface order');
          }
          return {
            id: userInterface.interface.id,
            order: userInterface.order,
          };
        }),
        catchError((error) => {
          console.error('Error updating interface order:', error);
          throw error;
        })
      );
  }

  updateInterfaceName(
    id: string,
    name: string
  ): Observable<Partial<InterfaceDto>> {
    return this.graphql
      .mutate<
        UpdateInterfaceMutationResponse,
        UpdateInterfaceMutationVariables
      >(
        undefined,
        updateInterfaceMutation,
        { id, name },
        { fetchPolicy: 'network-only' }
      )
      .pipe(
        map((response) => {
          const updatedInterface = response.updateInterface?.interface;
          if (!updatedInterface) {
            throw new Error('Failed to update interface name');
          }

          return {
            id: updatedInterface.id,
            name: updatedInterface.name,
            order: updatedInterface.userInterfaces.nodes[0].order,
          };
        }),
        catchError((error) => {
          console.error('Error updating interface name:', error);
          throw error;
        })
      );
  }

  private transformResponse(data: GetUserInterfacesType): InterfaceDto[] {
    if (!data?.user?.userInterfaces?.nodes) {
      return [];
    }

    return data.user.userInterfaces.nodes
      .filter(
        (
          node
        ): node is {
          order: number;
          interface: { id: string; name: string };
        } => !!node?.interface
      )
      .map(
        (node) =>
          new Interface({
            id: node.interface.id,
            name: node.interface.name,
            order: node.order,
          })
      );
  }
}
