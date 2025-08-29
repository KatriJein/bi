import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { InterfacesSelectors } from '../core/store/interfaces';
import {
  DashboardsActions,
  DashboardsSelectors,
} from '../core/store/dashboards';
import {
  WidgetFilterBindingService,
  WidgetService,
} from '../core/api/services';
import { DashboardFilter, Widget, WidgetType } from '../core/api/graphql/types';
import { ChartDto, SelectionTypeDashboard } from '../core/store/charts';
import { selectChartById } from '../core/store/charts/charts.selector';
import { WidgetsActions, WidgetsSelectors } from '../core/store/widgets';

@Injectable({
  providedIn: 'root',
})
export class DashboardStateService {
  private store = inject(Store);

  activeInterface$ = this.store.select(
    InterfacesSelectors.selectActiveInterface
  );

  dashboards$ = this.activeInterface$.pipe(
    map((intf) => intf?.id || ''),
    switchMap((interfaceId) =>
      this.store.select(
        DashboardsSelectors.selectDashboardHierarchyByInterfaceId(interfaceId)
      )
    )
  );

  activeDashboard$ = this.store.select(
    DashboardsSelectors.selectActiveDashboard
  );

  filters$ = this.activeDashboard$.pipe(
    map((dashboard) => dashboard?.selections || []),
    distinctUntilChanged()
  );

  multipleFilters$ = this.store.select(
    DashboardsSelectors.selectMultipleSelectionsByActiveDashboard
  );

  activeMultipleSelections$ = this.store.select(
    DashboardsSelectors.selectActiveMultipleSelections
  );

  widgets$ = this.activeDashboard$.pipe(
    filter((dashboard) => !!dashboard?.id),
    switchMap((dashboard) =>
      this.store.select(
        WidgetsSelectors.selectWidgetsByDashboard(dashboard?.id || '')
      )
    ),
    distinctUntilChanged()
  );

  setActiveDashboard(id: string) {
    this.store.dispatch(DashboardsActions.setActiveDashboard({ id }));
    this.store.dispatch(WidgetsActions.loadWidgets({ dashboardId: id }));
  }

  refreshWidgets() {
    this.activeDashboard$.pipe(take(1)).subscribe((dashboard) => {
      if (dashboard?.id) {
        this.store.dispatch(
          WidgetsActions.loadWidgets({ dashboardId: dashboard.id })
        );
      }
    });
  }

  createWidget(widgetData: Omit<Widget, 'id'>) {
    this.store.dispatch(WidgetsActions.createWidget({ widget: widgetData }));
  }

  updateWidget(widgetId: string, patch: Partial<Widget>) {
    this.store.dispatch(WidgetsActions.updateWidget({ widgetId, patch }));
  }

  deleteWidget(widgetId: string) {
    this.activeDashboard$.pipe(take(1)).subscribe((dashboard) => {
      if (!dashboard?.id) return;

      this.store.dispatch(
        WidgetsActions.deleteWidget({
          dashboardId: dashboard.id,
          widgetId,
        })
      );
    });
  }

  getWidgetType(chartId: string | null): WidgetType {
    if (!chartId) return 'text';

    let chart: ChartDto | undefined;
    this.store
      .select(selectChartById(chartId))
      .pipe(take(1))
      .subscribe((c) => (chart = c));

    if (!chart) return 'text';

    return chart?.settings?.chartType === 'table' ? 'table' : 'chart';
  }

  getTableName(id: string | null): string {
    if (!id) return '';

    let name: string = '';

    this.store
      .select(selectChartById(id))
      .pipe(take(1))
      .subscribe((c) => (name = c?.name || ''));

    return name;
  }

  addFilter(selection: SelectionTypeDashboard): void {
    this.activeDashboard$.pipe(take(1)).subscribe((dashboard) => {
      if (!dashboard) return;

      this.store.dispatch(
        DashboardsActions.createDashboardFilter({
          filter: {
            dashboardId: dashboard.id as string,
            name: selection.name,
            fieldType: selection.columnType,
            filterType: selection.filterType,
            isMultiple: selection.isMultiple,
            value: {
              value: selection.value,
            },
          },
        })
      );
    });
  }

  updateFilter(selectionId: string, selection: SelectionTypeDashboard): void {
    this.store.dispatch(
      DashboardsActions.updateDashboardFilter({
        id: selectionId,
        patch: {
          name: selection.name,
          fieldType: selection.columnType,
          filterType: selection.filterType,
          isMultiple: selection.isMultiple,
          value: {
            value: selection.value,
          },
        },
      })
    );
  }

  removeFilter(selection: DashboardFilter): void {
    this.activeDashboard$.pipe(take(1)).subscribe((dashboard) => {
      if (!dashboard) return;

      this.store.dispatch(
        DashboardsActions.deleteDashboardFilter({
          id: selection.id as string,
        })
      );
    });
  }

  onMultipleSelectionChange(filterId: string, value: any) {
    this.store.dispatch(
      DashboardsActions.setActiveMultipleSelection({ filterId, value })
    );
  }

  onClearMultipleSelection(filterId: string) {
    this.store.dispatch(
      DashboardsActions.clearActiveMultipleSelection({ filterId })
    );
  }

  constructor() {}
}
