import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GraphqlService } from './grapghql.service';
import {
  CreateWidgetType,
  DeleteWidgetType,
  UpdateWidgetType,
  GetWidgetsType,
  Widget,
  GetWidgetType,
} from '../../api/graphql/types';
import {
  createWidgetMutation,
  deleteWidgetMutation,
  updateWidgetMutation,
} from '../graphql/mutations';
import { getWidgetQuery, getWidgetsQuery } from '../graphql/queries';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  store = inject(Store);
  private graphql = inject(GraphqlService);

  constructor() {}

  loadWidgets(dashboardId: string): Observable<Widget[]> {
    return this.graphql
      .watchQuery<GetWidgetsType>(undefined, getWidgetsQuery, {
        dashboardId,
      })
      .pipe(
        map((res) => res.widgets.nodes),
        catchError((err) => {
          console.error('Error loading widgets:', err);
          return of([]);
        })
      );
  }

  createWidget(widget: Omit<Widget, 'id'>): Observable<Widget> {
    return this.graphql
      .mutate<CreateWidgetType>(undefined, createWidgetMutation, {
        chartId: widget.chartId,
        dashboardId: widget.dashboardId,
        position: widget.position,
        title: widget.title,
        type: widget.type,
        visualSettings: widget.visualSettings ?? {},
      })
      .pipe(
        map((res) => {
          const created = res.createWidget?.widget;
          if (!created) throw new Error('Widget creation failed');
          return created;
        }),
        catchError((err) => {
          console.error('Error creating widget:', err);
          throw err;
        })
      );
  }

  updateWidget(widgetId: string, widget: Partial<Widget>): Observable<Widget> {
    const cleanedPatch = Object.fromEntries(
      Object.entries(widget).filter(([_, value]) => value !== undefined)
    );

    return this.graphql
      .mutate<UpdateWidgetType>(undefined, updateWidgetMutation, {
        id: widgetId,
        patch: cleanedPatch,
      })
      .pipe(
        map((res) => {
          const updated = res.updateWidget?.widget;
          if (!updated) throw new Error('Widget update failed');
          return updated;
        }),
        catchError((err) => {
          console.error('Error updating widget:', err);
          throw err;
        })
      );
  }

  deleteWidget(id: string): Observable<string> {
    return this.graphql
      .mutate<DeleteWidgetType>(undefined, deleteWidgetMutation, { id })
      .pipe(
        map((res) => {
          const deletedId = res.deleteWidget?.widget?.id;
          if (!deletedId) throw new Error('Widget deletion failed');
          return deletedId;
        }),
        catchError((err) => {
          console.error('Error deleting widget:', err);
          throw err;
        })
      );
  }

  getWidgetById(widgetId: string): Observable<Widget | null> {
    return this.graphql
      .watchQuery<GetWidgetType>(undefined, getWidgetQuery, { id: widgetId })
      .pipe(
        map((res) => res.widget || null),
        catchError((err) => {
          console.error(`Error loading widget with id=${widgetId}:`, err);
          return of(null);
        })
      );
  }
}
