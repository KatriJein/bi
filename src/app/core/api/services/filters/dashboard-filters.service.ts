import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { GraphqlService } from '../grapghql.service';
import {
  CreateDashboardFilterResponse,
  CreateDashboardFilterVariables,
  DashboardFilter,
  DeleteDashboardFilterResponse,
  GetDashboardFiltersResponse,
  UpdateDashboardFilterResponse,
  UpdateDashboardFilterVariables,
} from '../../graphql/types';
import { getDashboardFiltersQuery } from '../../graphql/queries/dashboard-filter';
import {
  createDashboardFilterMutation,
  deleteDashboardFilterMutation,
  updateDashboardFilterMutation,
} from '../../graphql/mutations';

@Injectable({
  providedIn: 'root',
})
export class DashboardFiltersService {
  private graphql = inject(GraphqlService);

  getDashboardFilters(): Observable<DashboardFilter[]> {
    return this.graphql
      .watchQuery<GetDashboardFiltersResponse>(
        undefined,
        getDashboardFiltersQuery
      )
      .pipe(
        map((res) => res.dashboardFilters.nodes),
        catchError((err) => {
          console.error('Error loading dashboard filters', err);
          return of([]);
        })
      );
  }

  createDashboardFilter(
    variables: CreateDashboardFilterVariables
  ): Observable<DashboardFilter> {
    return this.graphql
      .mutate<CreateDashboardFilterResponse>(
        undefined,
        createDashboardFilterMutation,
        variables
      )
      .pipe(
        map((res) => res.createDashboardFilter.dashboardFilter),
        catchError((err) => {
          console.error('Error creating dashboard filter', err);
          throw err;
        })
      );
  }

  updateDashboardFilter(
    id: string,
    patch: UpdateDashboardFilterVariables['patch']
  ): Observable<DashboardFilter> {
    return this.graphql
      .mutate<UpdateDashboardFilterResponse>(
        undefined,
        updateDashboardFilterMutation,
        { id, patch }
      )
      .pipe(
        map((res) => res.updateDashboardFilter.dashboardFilter),
        catchError((err) => {
          console.error('Error updating dashboard filter', err);
          throw err;
        })
      );
  }

  deleteDashboardFilter(id: string): Observable<string> {
    return this.graphql
      .mutate<DeleteDashboardFilterResponse>(
        undefined,
        deleteDashboardFilterMutation,
        { id }
      )
      .pipe(
        map((res) => res.deleteDashboardFilter.dashboardFilter.id),
        catchError((err) => {
          console.error('Error deleting dashboard filter', err);
          throw err;
        })
      );
  }
}
