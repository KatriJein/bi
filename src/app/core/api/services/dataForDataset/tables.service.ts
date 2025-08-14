import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GetTablesType, Table } from '../../graphql/types';
import { getTablesQuery } from '../../graphql/queries';

@Injectable({ providedIn: 'root' })
export class TablesService {
  constructor(private apollo: Apollo) {}

  getTables(): Observable<Table[]> {
    return this.apollo
      .watchQuery<GetTablesType>({
        query: getTablesQuery,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((response) => this.transformResponse(response.data)),
        catchError((error) => {
          console.error('Error loading tables:', error);
          return of([]);
        })
      );
  }

  private transformResponse(data: GetTablesType): Table[] {
    return data.dbtables.nodes.map((table) => ({
      tableName: table.tableName,
    }));
  }
}
