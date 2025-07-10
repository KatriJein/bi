import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { InterfacesSelectors } from '../core/store/interfaces';
import {
  DashboardsActions,
  DashboardsSelectors,
} from '../core/store/dashboards';
import { WidgetService } from '../core/api/services';
import { Widget, WidgetType } from '../core/api/graphql/types';
import isEqual from 'lodash/isEqual';
import { ChartDto } from '../core/store/charts';
import { selectChartById } from '../core/store/charts/charts.selector';

@Injectable({
  providedIn: 'root',
})
export class DashboardStateService {
  private store = inject(Store);
  private widgetService = inject(WidgetService);

  activeInterface$ = this.store.select(
    InterfacesSelectors.selectActiveInterface
  );

  dashboards$ = this.activeInterface$.pipe(
    map((intf) => intf?.id || ''),
    switchMap((interfaceId) =>
      this.store.select(
        DashboardsSelectors.selectDashboardsByInterfaceId(interfaceId)
      )
    )
  );

  setActiveDashboard(id: string) {
    this.widgetsSubject.next([]);
    this.store.dispatch(DashboardsActions.setActiveDashboard({ id }));
    this.loadWidgets(id);
  }

  activeDashboard$ = this.store.select(
    DashboardsSelectors.selectActiveDashboard
  );

  private widgetsSubject = new BehaviorSubject<Widget[]>([]);
  widgets$ = this.widgetsSubject
    .asObservable()
    .pipe(distinctUntilChanged((a, b) => isEqual(a, b)));

  loadWidgets(dashboardId: string) {
    this.widgetService.loadWidgets(dashboardId).subscribe((widgets) => {
      this.widgetsSubject.next(widgets);
    });
  }

  createWidget(widget: Partial<Widget>) {
    return of(widget).pipe(
      withLatestFrom(this.activeDashboard$),
      switchMap(([widget, activeDashboard]) => {
        const dashboardId = widget.dashboardId || activeDashboard?.id || '';
        const newWidget: Omit<Widget, 'id'> = {
          dashboardId,
          title: '',
          type: 'text',
          position: { width: 8, height: 4, x: 0, y: 0 },
          ...widget,
        };

        return this.widgetService
          .createWidget(newWidget)
          .pipe(tap(() => this.loadWidgets(dashboardId)));
      })
    );
  }

  updateWidget(widgetId: string, widget: Partial<Widget>) {
    return of(widget).pipe(
      withLatestFrom(this.activeDashboard$),
      switchMap(([widget, activeDashboard]) => {
        const dashboardId = widget.dashboardId || activeDashboard?.id || '';
        return this.widgetService
          .updateWidget(widgetId, widget)
          .pipe(tap(() => this.loadWidgets(dashboardId)));
      })
    );
  }

  getWidgetType(chartId: string | null): WidgetType {
    if (chartId === null) {
      return 'text';
    }

    let chart: ChartDto | undefined;
    this.store
      .select(selectChartById(chartId))
      .pipe(take(1))
      .subscribe((c) => (chart = c));

    if (!chart) {
      return 'text';
    }

    const chartType = chart.settings?.chartType;

    if (chartType === 'table') {
      return 'table';
    }

    return 'chart';
  }

  removeWidget(id: string) {
    const current = this.widgetsSubject.getValue();
    this.widgetsSubject.next(current.filter((w) => w.id !== id));
  }

  addWidget(widget: Widget) {
    const current = this.widgetsSubject.getValue();
    this.widgetsSubject.next([...current, widget]);
  }

  deleteWidget(widget: Widget) {
    return this.widgetService
      .deleteWidget(widget.id)
      .pipe(tap(() => this.loadWidgets(widget.dashboardId)));
  }

  constructor() {}
}
