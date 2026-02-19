import { Injectable } from '@angular/core';
import { Observable, switchMap, map, of } from 'rxjs';
import {
  CreateUserResponse,
  CreateUserVariables,
  CreateUserRoleVariables,
  DeleteUserVariables,
  DeleteUserRoleVariables,
  UpdateUserVariables,
  UpdateUserRoleVariables,
  UpdateUserInterfaceVariables,
  DeleteUsersInterfaceVariables,
  CreateUserInterfaceVariables,
  GetUsersType,
  DeleteUserRoleResponse,
  DeleteUserResponse,
  CreateUserRoleResponse,
  UpdateUserResponse,
  UpdateUserRoleResponse,
  CreateUserInterfaceResponse,
  DeleteUsersInterfaceResponse,
  UpdateUserInterfaceResponse,
} from '../graphql/types';

import {
  createUserMutation,
  createUserRoleMutation,
  deleteUserMutation,
  deleteUserRoleMutation,
  updateUserMutation,
  updateUserRoleMutation,
  updateUserInterfaceMutation,
  deleteUserInterfaceMutation,
  createUserInterfaceMutation,
} from '../graphql/mutations';

import { getUsersQuery } from '../graphql/queries/users';
import { GraphqlService } from './grapghql.service';

export interface RawUser {
  id: string;
  name: string;
  roleId: string | null;
  interfaceIds: string[];
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private graphql: GraphqlService) {}

  getUsers(): Observable<RawUser[]> {
    return this.graphql.watchQuery<GetUsersType>(undefined, getUsersQuery).pipe(
      map((response) => {
        if (!response?.users?.nodes) return [];
        return response.users.nodes.map((node) => ({
          id: node.id,
          name: node.name,
          roleId: node.userRoles.nodes[0]?.roleId || null,
          interfaceIds: node.userInterfaces.nodes.map((n) => n.interfaceId),
          password: node.password,
        }));
      }),
    );
  }

  createUserWithRole(
    name: string,
    password: string | null,
    roleId: string,
  ): Observable<void> {
    return this.graphql
      .mutate<
        CreateUserResponse,
        CreateUserVariables
      >(undefined, createUserMutation, { name, password })
      .pipe(
        switchMap((result) => {
          const userId = result.createUser.user.id;
          return this.graphql.mutate<CreateUserRoleResponse, CreateUserRoleVariables>(
            undefined,
            createUserRoleMutation,
            { userId, roleId },
          );
        }),
        map(() => void 0),
      );
  }

  deleteUserWithRole(userId: string, roleId: string): Observable<void> {
    return this.graphql
      .mutate<
        DeleteUserRoleResponse,
        DeleteUserRoleVariables
      >(undefined, deleteUserRoleMutation, { userId, roleId })
      .pipe(
        switchMap(() =>
          this.graphql.mutate<DeleteUserResponse, DeleteUserVariables>(
            undefined,
            deleteUserMutation,
            { id: userId },
          ),
        ),
        map(() => void 0),
      );
  }

  updateUser(
    id: string,
    name?: string | null,
    password?: string | null,
  ): Observable<void> {
    return this.graphql
      .mutate<
        UpdateUserResponse,
        UpdateUserVariables
      >(undefined, updateUserMutation, { id, name, password })
      .pipe(map(() => void 0));
  }

  updateUserRole(
    userId: string,
    oldRoleId: string,
    newRoleId: string,
  ): Observable<void> {
    return this.graphql
      .mutate<
        UpdateUserRoleResponse,
        UpdateUserRoleVariables
      >(undefined, updateUserRoleMutation, { userId, roleId: oldRoleId, roleId1: newRoleId })
      .pipe(map(() => void 0));
  }

  createUserInterface(
    userId: string,
    interfaceId: string,
    order?: number,
  ): Observable<void> {
    return this.graphql
      .mutate<
        CreateUserInterfaceResponse,
        CreateUserInterfaceVariables
      >(undefined, createUserInterfaceMutation, { userId, interfaceId, order })
      .pipe(map(() => void 0));
  }

  deleteUserInterface(
    userId: string,
    interfaceId: string,
    order: number,
  ): Observable<void> {
    return this.graphql
      .mutate<
        DeleteUsersInterfaceResponse,
        DeleteUsersInterfaceVariables
      >(undefined, deleteUserInterfaceMutation, { userId, interfaceId, order })
      .pipe(map(() => void 0));
  }

  updateUserInterface(
    userId: string,
    currentInterfaceId: string,
    currentOrder: number,
    newInterfaceId?: string,
    newOrder?: number,
  ): Observable<void> {
    return this.graphql
      .mutate<UpdateUserInterfaceResponse, UpdateUserInterfaceVariables>(
        undefined,
        updateUserInterfaceMutation,
        {
          userId,
          interfaceId: currentInterfaceId,
          order: currentOrder,
          interfaceId1: newInterfaceId,
          order1: newOrder,
        },
      )
      .pipe(map(() => void 0));
  }
}
