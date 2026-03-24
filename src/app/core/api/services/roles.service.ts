import { Observable, of } from 'rxjs';
import { catchError, map, } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { GraphqlService } from './grapghql.service';
import { Permission, RoleDto } from '../../store/user';
import { CreateRoleVariables, DeleteRoleVariables, GetRolesType, UpdateRoleVariables } from '../graphql/types';
import { getRolesQuery } from '../graphql/queries';
import { createRoleMutation, deleteRoleMutation, updateRoleMutation } from '../graphql/mutations';


@Injectable({ providedIn: 'root' })
export class RolesService {
  private store = inject(Store);
  private graphql = inject(GraphqlService);

  loadRoles(): Observable<RoleDto[]> {
    return this.graphql
      .watchQuery<GetRolesType>(undefined, getRolesQuery)
      .pipe(
        map(response => this.transformResponse(response)),
        catchError(error => {
          console.error('Error loading roles:', error);
          return of([]);
        })
      );
  }

  createRole(name: string, permissions: Permission[] = []): Observable<void> {
    return this.graphql
      .mutate<undefined, CreateRoleVariables>(
        undefined,
        createRoleMutation,
        { name, permissions }
      )
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error('Error creating role:', error);
          throw error;
        })
      );
  }

  updateRole(id: string, name: string, permissions: Permission[]): Observable<void> {
    return this.graphql
      .mutate<undefined, UpdateRoleVariables>(
        undefined,
        updateRoleMutation,
        { id, name, permissions }
      )
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error('Error updating role:', error);
          throw error;
        })
      );
  }

  deleteRole(id: string): Observable<void> {
    return this.graphql
      .mutate<undefined, DeleteRoleVariables>(
        undefined,
        deleteRoleMutation,
        { id }
      )
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error('Error deleting role:', error);
          throw error;
        })
      );
  }

  private transformResponse(data: GetRolesType): RoleDto[] {
    const nodes = data?.roles?.nodes;
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return [];
    }

    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      permissions: node.permissions
    }));
  }
}
