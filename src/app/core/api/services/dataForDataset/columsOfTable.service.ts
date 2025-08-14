import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { GetTableColumnsType, TableColumn } from '../../graphql/types';
import { getColumsOfTableQuery } from '../../graphql/queries';
import { mapPostgresTypeToTs } from '../../../utils';

@Injectable({ providedIn: 'root' })
export class TableSchemaService {
  constructor(private apollo: Apollo) {}

  getTableColumns(tableName: string): Observable<TableColumn[]> {
    return this.apollo
      .watchQuery<GetTableColumnsType>({
        query: getColumsOfTableQuery,
        variables: { name: tableName },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((response) => this.transformResponse(response.data)),
        catchError((error) => {
          console.error('Error loading table columns:', error);
          return of([]);
        })
      );
  }

  private transformResponse(data: GetTableColumnsType): TableColumn[] {
    return data.dbfields.nodes.map((column) => ({
      tableName: column.tableName,
      columnName: column.columnName,
      dataType: mapPostgresTypeToTs(column.dataType),
    }));
  }
}
