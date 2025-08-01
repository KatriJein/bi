import { combineLatest, map, Observable, of } from 'rxjs';
import {
  ChartFilter,
  DashboardFilter,
  WidgetFilterBinding,
} from '../core/api/graphql/types';
import { FilterTypeExp } from '../pages';

export function convertBindingsToFilters(
  bindings$: Observable<WidgetFilterBinding[]>,
  chartSelections$: Observable<ChartFilter[]>,
  dashboardSelections$: Observable<DashboardFilter[]>
): Observable<FilterTypeExp[]> {
  return combineLatest([
    bindings$,
    chartSelections$,
    dashboardSelections$,
  ]).pipe(
    map(([bindings, chartFilters, dashboardFilters]) => {
      return bindings
        .map((binding) => {
          const chartFilter = chartFilters.find(
            (f) => f.id === binding.chartFilterId
          );
          const dashboardFilter = dashboardFilters.find(
            (f) => f.id === binding.dashboardFilterId
          );

          if (!chartFilter || !dashboardFilter) return null;

          return {
            field: chartFilter.fieldName,
            operator: chartFilter.filterType,
            value: dashboardFilter.value.value,
          } as FilterTypeExp;
        })
        .filter(Boolean) as FilterTypeExp[];
    })
  );
}
