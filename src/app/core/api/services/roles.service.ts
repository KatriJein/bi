import { Observable, of } from 'rxjs';
import { catchError, map, } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { GraphqlService } from './grapghql.service';
import { RoleDto } from '../../store/user';
import { GetRolesType } from '../graphql/types';
import { getRolesQuery } from '../graphql/queries';


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

  private transformResponse(data: GetRolesType): RoleDto[] {
    const nodes = data?.roles?.nodes;
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return [];
    }

    return nodes.map(node => ({
      id: node.id,
      name: node.name
    }));
  }
}
