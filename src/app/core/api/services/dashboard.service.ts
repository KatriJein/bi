import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DashboardDto } from '../../store/dashboards';
import { inject, Injectable } from '@angular/core';
import {
  CreateDashboardResponse,
  CreateDashboardVariables,
  CreateInterfaceDashboardMutation,
  CreateInterfaceDashboardMutationVariables,
  DashboardPatch,
  DeleteDashboardResponse,
  DeleteInterfaceDashboardResponse,
  GetUserDashboardsType,
  UpdateDashboardMutationResponse,
  UpdateDashboardOrderMutationResponse,
  UpdateDashboardOrderMutationVariables,
} from '../graphql/types';
import { getUserDashboardsQuery } from '../graphql/queries';
import {
  createDashboardMutation,
  createInterfaceDashboardMutation,
  deleteDashboardMutation,
  deleteInterfaceDashboardMutation,
  updateDashboardMutation,
  updateDashboardOrderMutation,
} from '../graphql/mutations';
import { GraphqlService } from './grapghql.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private grapghql = inject(GraphqlService);
  constructor() {}

  loadUserDashboards(interfaceId: string): Observable<DashboardDto[]> {
    return this.grapghql
      .watchQuery<GetUserDashboardsType>(undefined, getUserDashboardsQuery, {
        id: interfaceId,
      })
      .pipe(
        map((response) => this.transformResponse(response)),
        catchError((error) => {
          console.error('Error loading dashboards:', error);
          return of([]);
        })
      );
  }

  createDashboard(
    name: string,
    interfaceId: string,
    order?: number
  ): Observable<{ order: number; id: string; name: string } | null> {
    return this.grapghql
      .mutate<CreateDashboardResponse, CreateDashboardVariables>(
        undefined,
        createDashboardMutation,
        {
          name,
        }
      )
      .pipe(
        switchMap((createResult) => {
          const dashboardId = createResult.createDashboard?.dashboard?.id;
          if (!dashboardId) {
            throw new Error('Failed to create dashboard');
          }

          return this.grapghql
            .mutate<
              CreateInterfaceDashboardMutation,
              CreateInterfaceDashboardMutationVariables
            >(undefined, createInterfaceDashboardMutation, {
              dashboardId,
              interfaceId,
              order,
            })
            .pipe(
              map((result) => {
                const interfaceDashboard =
                  result.createInterfaceDashboard?.interfaceDashboard;
                if (!interfaceDashboard) {
                  throw new Error('Failed to create interface dashboard');
                }
                return {
                  order: interfaceDashboard.order,
                  id: interfaceDashboard.dashboard.id,
                  name: interfaceDashboard.dashboard.name,
                };
              })
            );
        }),
        catchError((error) => {
          console.error('Error creating dashboard:', error);
          return of(null);
        })
      );
  }

  deleteDashboard(
    dashboardId: string,
    interfaceId: string,
    order: number
  ): Observable<string> {
    return this.grapghql
      .mutate<DeleteInterfaceDashboardResponse>(
        undefined,
        deleteInterfaceDashboardMutation,
        { dashboardId, interfaceId, order }
      )
      .pipe(
        switchMap((deleteInterfaceResult) => {
          const deletedId =
            deleteInterfaceResult.deleteInterfaceDashboard?.dashboard?.id;
          if (!deletedId) {
            throw new Error('Failed to delete dashboard from interface');
          }

          return this.grapghql
            .mutate<DeleteDashboardResponse>(
              undefined,
              deleteDashboardMutation,
              { id: deletedId }
            )
            .pipe(
              map((finalResult) => {
                const id = finalResult.deleteDashboard?.dashboard?.id;
                if (!id) throw new Error('Failed to delete dashboard');
                return id;
              })
            );
        }),
        catchError((error) => {
          console.error('Error deleting dashboard:', error);
          return of('');
        })
      );
  }

  private transformResponse(data: GetUserDashboardsType): DashboardDto[] {
    if (!data?.interfaceDashboards?.nodes) {
      return [];
    }

    return data.interfaceDashboards.nodes
      .filter(
        (
          node
        ): node is {
          order: number;
          dashboard: {
            id: string;
            name: string;
            color: string;
            iconId: string;
          };
        } => !!node?.dashboard
      )
      .map((node) => {
        return {
          id: node.dashboard.id,
          name: node.dashboard.name,
          order: node.order,
          color: node.dashboard.color,
          iconId: node.dashboard.iconId,
        };
      });
  }

  updateDashboard(
    id: string,
    patch: DashboardPatch
  ): Observable<Partial<DashboardDto> | null> {
    return this.grapghql
      .mutate<UpdateDashboardMutationResponse>(
        undefined,
        updateDashboardMutation,
        { id, patch }
      )
      .pipe(
        map((response) => {
          const dashboard = response.updateDashboard?.dashboard;
          if (!dashboard) {
            throw new Error('Failed to update dashboard');
          }
          return {
            id: dashboard.id,
            name: dashboard.name,
            color: dashboard.color,
            iconId: dashboard.iconId,
          };
        }),
        catchError((error) => {
          console.error('Error updating dashboard:', error);
          return of(null);
        })
      );
  }

  updateDashboardOrder(
    dashboardId: string,
    interfaceId: string,
    order: number,
    newOrder: number
  ): Observable<{ id: string; order: number }> {
    return this.grapghql
      .mutate<
        UpdateDashboardOrderMutationResponse,
        UpdateDashboardOrderMutationVariables
      >(undefined, updateDashboardOrderMutation, {
        dashboardId,
        interfaceId,
        order,
        newOrder,
      })
      .pipe(
        map((response) => {
          const node = response.updateInterfaceDashboard?.interfaceDashboard;
          if (!node || !node.dashboard) {
            throw new Error('Failed to update dashboard order');
          }
          return {
            id: node.dashboard.id,
            order: node.order,
          };
        }),
        catchError((error) => {
          console.error('Error updating dashboard order:', error);
          throw error;
        })
      );
  }
}
