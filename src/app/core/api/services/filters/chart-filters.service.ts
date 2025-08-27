import { inject, Injectable } from '@angular/core';
import { GraphqlService } from '../grapghql.service';
import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  ChartFilter,
  CreateChartFilterResponse,
  CreateChartFilterVariables,
  DeleteChartFilterResponse,
  GetChartFiltersResponse,
  UpdateChartFilterResponse,
  UpdateChartFilterVariables,
} from '../../graphql/types';
import {
  createChartFilterMutation,
  deleteChartFilterMutation,
  updateChartFilterMutation,
} from '../../graphql/mutations';
import {
  getChartFiltersByIdQuery,
  getChartFiltersQuery,
} from '../../graphql/queries';

@Injectable({
  providedIn: 'root',
})
export class ChartFiltersService {
  private graphql = inject(GraphqlService);

  getChartFilters(): Observable<ChartFilter[]> {
    return this.graphql
      .watchQuery<GetChartFiltersResponse>(undefined, getChartFiltersQuery)
      .pipe(
        map((res) => res.chartFilters.nodes),
        catchError((err) => {
          console.error('Error loading chart filters', err);
          return of([]);
        })
      );
  }

  createChartFilter(
    variables: CreateChartFilterVariables
  ): Observable<ChartFilter> {
    return this.graphql
      .mutate<CreateChartFilterResponse>(
        undefined,
        createChartFilterMutation,
        variables
      )
      .pipe(
        map((res) => res.createChartFilter.chartFilter),
        catchError((err) => {
          console.error('Error creating chart filter', err);
          throw err;
        })
      );
  }

  updateChartFilter(
    id: string,
    patch: UpdateChartFilterVariables['patch']
  ): Observable<ChartFilter> {
    return this.graphql
      .mutate<UpdateChartFilterResponse>(undefined, updateChartFilterMutation, {
        id,
        patch,
      })
      .pipe(
        map((res) => res.updateChartFilter.chartFilter),
        catchError((err) => {
          console.error('Error updating chart filter', err);
          throw err;
        })
      );
  }

  deleteChartFilter(id: string): Observable<string> {
    return this.graphql
      .mutate<DeleteChartFilterResponse>(undefined, deleteChartFilterMutation, {
        id,
      })
      .pipe(
        map((res) => res.deleteChartFilter.chartFilter.id),
        catchError((err) => {
          console.error('Error deleting chart filter', err);
          throw err;
        })
      );
  }

  getChartFiltersByChartId(chartId: string): Observable<ChartFilter[]> {
    return this.graphql
      .watchQuery<GetChartFiltersResponse>(
        undefined,
        getChartFiltersByIdQuery,
        { chartId }
      )
      .pipe(
        map((res) => res.chartFilters.nodes),
        catchError((err) => {
          console.error(
            `Error loading chart filters for chartId=${chartId}`,
            err
          );
          return of([]);
        })
      );
  }
}
