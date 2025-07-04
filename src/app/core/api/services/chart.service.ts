import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GraphqlService } from './grapghql.service';
import { getChartsQuery, getDataQuery } from '../graphql/queries';
import { ChartDto, sortingType } from '../../store/charts';
import {
  CreateChartType,
  DeleteChartType,
  GetChartsType,
  getDataType,
  UpdateChartType,
} from '../graphql/types';
import {
  createChartMutation,
  deleteChartMutation,
  updateChartMutation,
} from '../graphql/mutations';
import { GetChartByIdType } from '../graphql/types/chart/getChartById.type';
import { getChartByIdQuery } from '../graphql/queries/chart/getChartById.query';

@Injectable({ providedIn: 'root' })
export class ChartService {
  private graphql = inject(GraphqlService);
  constructor() {}

  getCharts(): Observable<ChartDto[]> {
    return this.graphql
      .watchQuery<GetChartsType>(undefined, getChartsQuery)
      .pipe(
        map((res) => res.charts?.nodes ?? []),
        catchError((err) => {
          console.error('Error loading charts', err);
          return of([]);
        })
      );
  }

  createChart(chart: {
    name: string;
    datasetId: string;
    xAxis: string;
    yAxis: string[];
    filters?: Record<string, any>;
    sorting?: sortingType[];
    settings?: Record<string, any>;
  }): Observable<ChartDto> {
    const variables = {
      name: chart.name,
      datasetId: chart.datasetId,
      xAxis: chart.xAxis,
      yAxis: chart.yAxis,
      filters: chart.filters || null,
      sorting: chart.sorting || null,
      settings: chart.settings || null,
    };

    return this.graphql
      .mutate<CreateChartType>(undefined, createChartMutation, variables)
      .pipe(
        map((res) => res.createChart.chart),
        catchError((err) => {
          console.error('Error creating chart', err);
          throw err;
        })
      );
  }

  getData(
    tableName: string,
    columns: string[]
  ): Observable<Array<Record<string, any>>> {
    if (!tableName || columns.length === 0) {
      return of([]);
    }

    const query = getDataQuery(tableName, columns);

    return this.graphql.query<getDataType>(undefined, query).pipe(
      map((res) => {
        const tableData = res?.[tableName]?.nodes ?? [];
        return tableData;
      }),
      catchError((err) => {
        console.error(`Error fetching data from ${tableName}`, err);
        return of([]);
      })
    );
  }

  getChartById(id: string): Observable<ChartDto | null> {
    return this.graphql.query<GetChartByIdType>(id, getChartByIdQuery).pipe(
      map((res) => res.chart ?? null),
      catchError((err) => {
        console.error(`Error loading chart with id ${id}`, err);
        return of(null);
      })
    );
  }

  updateChart(
    id: string,
    patch: {
      name?: string;
      datasetId?: string;
      xAxis?: string;
      yAxis?: string[];
      filters?: Record<string, any>;
      sorting?: sortingType[];
      settings?: Record<string, any>;
    }
  ): Observable<ChartDto> {
    return this.graphql
      .mutate<UpdateChartType>(undefined, updateChartMutation, {
        id,
        patch,
      })
      .pipe(
        map((res) => res.updateChart.chart),
        catchError((err) => {
          console.error(`Error updating chart with id ${id}`, err);
          throw err;
        })
      );
  }

  deleteChart(id: string): Observable<string> {
    return this.graphql
      .mutate<DeleteChartType>(undefined, deleteChartMutation, { id })
      .pipe(
        map((res) => {
          const chartId = res?.deleteChart?.chart?.id;
          if (!chartId) {
            throw new Error('Chart ID not returned in deleteChart response');
          }
          return chartId;
        }),
        catchError((err) => {
          console.error(`Error deleting chart with id ${id}`, err);
          throw err;
        })
      );
  }
}
