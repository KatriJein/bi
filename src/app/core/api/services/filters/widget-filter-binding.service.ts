import { inject, Injectable } from '@angular/core';
import { GraphqlService } from '../grapghql.service';
import { catchError, map, Observable, of } from 'rxjs';
import {
  CreateWidgetFilterBindingResponse,
  CreateWidgetFilterBindingVariables,
  DeleteWidgetFilterBindingResponse,
  GetWidgetFilterBindingResponse,
  UpdateWidgetFilterBindingResponse,
  UpdateWidgetFilterBindingVariables,
  WidgetFilterBinding,
} from '../../graphql/types';
import { getWidgetFilterBindingQuery } from '../../graphql/queries';
import {
  createWidgetFilterBindingMutation,
  deleteWidgetFilterBindingMutation,
  updateWidgetFilterBindingMutation,
} from '../../graphql/mutations';

@Injectable({
  providedIn: 'root',
})
export class WidgetFilterBindingService {
  private graphql = inject(GraphqlService);

  getWidgetFilterBindings(): Observable<WidgetFilterBinding[]> {
    return this.graphql
      .watchQuery<GetWidgetFilterBindingResponse>(
        undefined,
        getWidgetFilterBindingQuery
      )
      .pipe(
        map((res) => res.widgetFilterBindings.nodes),
        catchError((err) => {
          console.error('Error loading widget filter bindings', err);
          return of([]);
        })
      );
  }

  createWidgetFilterBinding(
    variables: CreateWidgetFilterBindingVariables
  ): Observable<WidgetFilterBinding> {
    return this.graphql
      .mutate<CreateWidgetFilterBindingResponse>(
        undefined,
        createWidgetFilterBindingMutation,
        variables
      )
      .pipe(
        map((res) => res.createWidgetFilterBinding.widgetFilterBinding),
        catchError((err) => {
          console.error('Error creating widget filter binding', err);
          throw err;
        })
      );
  }

  updateWidgetFilterBinding(
    id: string,
    patch: UpdateWidgetFilterBindingVariables['patch']
  ): Observable<WidgetFilterBinding> {
    return this.graphql
      .mutate<UpdateWidgetFilterBindingResponse>(
        undefined,
        updateWidgetFilterBindingMutation,
        { id, patch }
      )
      .pipe(
        map((res) => res.updateWidgetFilterBinding.widgetFilterBinding),
        catchError((err) => {
          console.error('Error updating widget filter binding', err);
          throw err;
        })
      );
  }

  deleteWidgetFilterBinding(id: string): Observable<string> {
    return this.graphql
      .mutate<DeleteWidgetFilterBindingResponse>(
        undefined,
        deleteWidgetFilterBindingMutation,
        { id }
      )
      .pipe(
        map((res) => res.deleteWidgetFilterBinding.widgetFilterBinding.id),
        catchError((err) => {
          console.error('Error deleting widget filter binding', err);
          throw err;
        })
      );
  }
}
