import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GraphqlService } from './grapghql.service';
import { DatasetDto } from '../../store/datasets';
import {
  CreateDatasetType,
  DeleteDatasetType,
  GetDatasetsType,
  GetDatasetType,
  SettingsColumn,
  TableColumn,
  UpdateDatasetType,
} from '../graphql/types';
import { getDatasetQuery, getDatasetsQuery } from '../graphql/queries';
import { Column, Dataset } from '../../models';
import {
  createDatasetMutation,
  deleteDatasetMutation,
  updateDatasetMutation,
} from '../graphql/mutations';
import { TsType } from '../../utils';

@Injectable({ providedIn: 'root' })
export class DatasetService {
  constructor(private graphql: GraphqlService) {}

  getDatasets(): Observable<DatasetDto[]> {
    return this.graphql
      .watchQuery<GetDatasetsType>(undefined, getDatasetsQuery)
      .pipe(
        map((result) => {
          const datasets = result?.dataSets?.nodes ?? [];
          return datasets.map(this.transformDataset);
        }),
        catchError((err) => {
          console.error('Error loading datasets', err);
          return of([]);
        })
      );
  }

  getDataset(id: string): Observable<DatasetDto | null> {
    return this.graphql
      .watchQuery<GetDatasetType>(undefined, getDatasetQuery, { id })
      .pipe(
        map((result) => {
          const dataset = result?.dataSet ?? null;
          return this.transformDataset(dataset);
        }),
        catchError((err) => {
          console.error('Error loading datasets', err);
          return of(null);
        })
      );
  }

  createDataset(dataset: Dataset): Observable<DatasetDto> {
    const { name, query, settings, columns, tableName } = dataset;

    const settingsString = this.serializeSettings(settings, columns, tableName);

    return this.graphql
      .mutate<CreateDatasetType>(undefined, createDatasetMutation, {
        name,
        query,
        settings: settingsString,
      })
      .pipe(
        map((res) => this.transformDataset(res.createDataSet.dataSet)),
        catchError((err) => {
          console.error('Error creating dataset', err);
          throw err;
        })
      );
  }

  updateDataset(id: string, patch: Partial<Dataset>): Observable<DatasetDto> {
    const patchToSend = {
      id: patch.id,
      name: patch.name,
      query: patch.query,
      settings: this.serializeSettings(
        patch.settings,
        patch.columns,
        patch.tableName
      ),
    };

    return this.graphql
      .mutate<UpdateDatasetType>(undefined, updateDatasetMutation, {
        id,
        patch: patchToSend,
      })
      .pipe(
        map((res) => this.transformDataset(res.updateDataSet.dataSet)),
        catchError((err) => {
          console.error('Error updating dataset', err);
          throw err;
        })
      );
  }

  deleteDataset(id: string): Observable<string> {
    return this.graphql
      .mutate<DeleteDatasetType>(undefined, deleteDatasetMutation, { id })
      .pipe(
        map((res) => res.deleteDataSet.dataSet.id),
        catchError((err) => {
          console.error('Error deleting dataset', err);
          throw err;
        })
      );
  }

  private transformDataset(dataset: {
    id: string;
    name: string;
    query: string;
    settings: string;
  }): DatasetDto {
    let settings: any = {};
    let columns: Column[] = [];

    try {
      settings = JSON.parse(dataset.settings);
      let parsedColumns = settings.columns || [];

      if (typeof parsedColumns === 'string') {
        parsedColumns = JSON.parse(parsedColumns);
      }

      if (Array.isArray(parsedColumns)) {
        columns = parsedColumns.map((col: SettingsColumn) => ({
          alias: col.title,
          columnName: col.name,
          tableName: col.tableName || '',
          dataType: col.type as TsType,
          isVisible: col.visible,
          aggregate: col.aggregate || 'NONE',
        }));
      } else {
        console.warn('settings.columns не массив', parsedColumns);
      }
    } catch (err) {
      console.warn('Ошибка парсинга settings или columns', err);
    }

    return {
      id: dataset.id,
      name: dataset.name,
      query: dataset.query || settings.query || '',
      connection: '',
      settings,
      columns,
      tableName: settings.tableName || '',
    };
  }

  private serializeSettings(
    settings: any = {},
    columns?: Column[],
    tableName?: string
  ): string {
    const serializedColumns = (columns || []).map((col) => ({
      name: col.columnName,
      title: col.alias,
      tableName: col.tableName,
      type: col.dataType,
      visible: col.isVisible,
      aggregate: col.aggregate,
    }));

    return JSON.stringify({
      ...settings,
      tableName,
      columns: serializedColumns,
    });
  }
}
