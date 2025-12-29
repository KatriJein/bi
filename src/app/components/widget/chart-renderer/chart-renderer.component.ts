import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DatasetDto, DatasetsSelectors } from '../../../core/store/datasets';
import { ChartDto, ChartsSelectors } from '../../../core/store/charts';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { select, Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FilterColumn } from '../../../services/chart-state.service';
import {
  buildChartData,
  buildChartOptions,
  collectAllColumns,
  createChartDataRequests,
  findColumnByName,
  findColumnsByNames,
  groupColumnsByTable,
  normalizeChartType,
  processChartData,
} from '../../../utils';
import { Column } from '../../../core/models';
import { ChartService } from '../../../core/api/services';
import { FilterEmitType, FilterTypeExp } from '../../../pages';
import { DoughnutChartComponent } from '../../chart/custom-charts/doughnut-procent/doughnut-procent.component';

@Component({
  selector: 'app-chart-renderer',
  imports: [CommonModule, BaseChartDirective, DoughnutChartComponent],
  templateUrl: './chart-renderer.component.html',
  styleUrl: './chart-renderer.component.scss',
})
export class ChartRendererComponent implements OnChanges, OnDestroy {
  private store = inject(Store);
  private chartService = inject(ChartService);

  @Input() chartId!: string;
  @Input() initialFilters?: FilterTypeExp[] | null;
  @Output() chartClick = new EventEmitter<FilterEmitType>();

  private chartSubject = new BehaviorSubject<ChartDto | null>(null);
  private datasetSubject = new BehaviorSubject<DatasetDto | null>(null);

  private chartSub?: Subscription;
  private datasetSub?: Subscription;

  chart$ = this.chartSubject.asObservable();
  dataset$ = this.datasetSubject.asObservable();

  chartData: ChartConfiguration['data'] | undefined = undefined;
  chartOptions: ChartConfiguration['options'] | undefined = undefined;
  chartType: ChartConfiguration['type'] = 'line';

  private sub?: Subscription;
  private filtersSubject = new BehaviorSubject<FilterTypeExp[]>([]);

  chartData$: Observable<any> = combineLatest([
    this.chart$.pipe(filter((chart): chart is ChartDto => chart !== null)),
    this.dataset$.pipe(filter((d): d is DatasetDto => d !== null)),
    this.filtersSubject,
  ]).pipe(
    switchMap(([chart, dataset, filters]) => {
      const xAxisColumn = chart.xAxis
        ? findColumnByName(chart.xAxis, dataset)
        : null;

      const yAxisColumns = Array.isArray(chart.yAxis)
        ? findColumnsByNames(chart.yAxis, dataset)
        : [];

      const combinedFilters = this.combineFilters(chart.filters || [], filters);

      const filtersColumns: FilterColumn[] = combinedFilters
        .map((f) => {
          const baseCol = findColumnByName(f.columnName, dataset);
          return baseCol
            ? ({
                ...baseCol,
                filterType: f.filterType,
                value: f.value,
                dateGranularity: f.dateGranularity,
              } as FilterColumn)
            : null;
        })
        .filter((x): x is FilterColumn => x !== null);

      const sortingColumns = Array.isArray(chart.sorting)
        ? findColumnsByNames(
            chart.sorting.map((s) => s.columnName),
            dataset
          )
            .map((col) => {
              const sortingItem = chart.sorting!.find(
                (s) => s.columnName === col.columnName
              );
              return sortingItem
                ? {
                    ...col,
                    direction: sortingItem.direction,
                  }
                : null;
            })
            .filter(
              (col): col is Column & { direction: 'asc' | 'desc' } =>
                col !== null
            )
        : [];

      const allCols = collectAllColumns(
        xAxisColumn,
        yAxisColumns,
        filtersColumns,
        sortingColumns
      );

      const colsByTable = groupColumnsByTable(allCols);

      const requests = createChartDataRequests(colsByTable, this.chartService);

      if (requests.length === 0) {
        return of([]);
      }

      return requests.length === 1
        ? requests[0].pipe(
            map(({ data }) =>
              processChartData(
                data,
                chart.xAxis as string,
                yAxisColumns,
                sortingColumns,
                filtersColumns
              )
            )
          )
        : combineLatest(requests).pipe(
            map((results) => {
              const merged = results.flatMap((r) => r.data);
              return processChartData(
                merged,
                chart.xAxis as string,
                yAxisColumns,
                sortingColumns,
                filtersColumns
              );
            })
          );
    })
  );

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters']) {
      this.filtersSubject.next(this.initialFilters || []);
    }

    if ('chartId' in changes && this.chartId) {
      const chartSub = this.store
        .select(ChartsSelectors.selectChartById(this.chartId))
        .subscribe((chart) => {
          this.chartSubject.next(chart ?? null);

          if (
            chart?.settings?.chartType &&
            chart.settings.chartType !== 'table'
          ) {
            this.chartType = normalizeChartType(chart.settings.chartType);
          }

          if (chart?.datasetId) {
            this.datasetSub?.unsubscribe();
            this.datasetSub = this.store
              .select(DatasetsSelectors.selectDatasetById(chart.datasetId))
              .subscribe((dataset) => {
                this.datasetSubject.next(dataset ?? null);
              });
          } else {
            this.datasetSub?.unsubscribe();
            this.datasetSubject.next(null);
          }
        });

      this.chartSub?.unsubscribe();
      this.chartSub = chartSub;

      this.sub?.unsubscribe();
      this.sub = this.chartData$.subscribe((aggregatedData) => {
        this.chartSubject.pipe(take(1)).subscribe((chart) => {
          this.datasetSubject.pipe(take(1)).subscribe((dataset) => {
            if (!chart || !dataset || !aggregatedData) {
              console.warn('[ChartRenderer] Missing chart/dataset/data');
              return;
            }

            const xAxis = chart.xAxis
              ? [findColumnByName(chart.xAxis, dataset)]
              : [];

            const yAxis = Array.isArray(chart.yAxis)
              ? findColumnsByNames(chart.yAxis, dataset)
              : [];

            this.chartData = buildChartData(
              aggregatedData,
              xAxis.filter((col): col is Column => col !== null),
              yAxis,
              chart.settings?.chartType || 'line',
              chart.settings?.colors
            );
            this.chartOptions = buildChartOptions(
              xAxis.filter((col): col is Column => col !== null),
              yAxis,
              chart.settings?.chartType || 'line'
            );
          });
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chartSub?.unsubscribe();
    this.datasetSub?.unsubscribe();
  }

  private combineFilters(
    chartFilters: any[],
    initialFilters: FilterTypeExp[]
  ): FilterColumn[] {
    const initialAsFilterColumns = initialFilters.map((filter) => ({
      columnName: filter.field,
      filterType: filter.operator ? filter.operator : 'Равно',
      value: filter.value,
      dateGranularity: filter.dateGranularity,
    }));

    const combined = [...chartFilters];

    initialAsFilterColumns.forEach((initialFilter) => {
      const existingIndex = combined.findIndex(
        (f) => f.columnName === initialFilter.columnName
      );
      if (existingIndex >= 0) {
        combined[existingIndex] = initialFilter;
      } else {
        combined.push(initialFilter);
      }
    });
    return combined;
  }

  onChartClick(event: any) {
    if (!this.chartSubject.value?.childId) {
      console.error('Child chart ID is missing');
      return;
    }

    if (event.active?.length > 0) {
      const clickedElementIndex = event.active[0].index;
      const datasetIndex = event.active[0].datasetIndex;

      this.chartSubject.pipe(take(1)).subscribe((chart) => {
        this.datasetSubject.pipe(take(1)).subscribe((dataset) => {
          if (!chart || !dataset) return;

          const xAxis = chart.xAxis;
          const yAxis = Array.isArray(chart.yAxis)
            ? chart.yAxis[datasetIndex]
            : chart.yAxis;

          if (!xAxis || !yAxis) return;

          const xValue = this.chartData?.labels?.[clickedElementIndex];
          const yValue =
            this.chartData?.datasets?.[datasetIndex]?.data?.[
              clickedElementIndex
            ];

          const filters = [
            { field: xAxis, value: xValue },
            { field: yAxis, value: yValue },
          ];

          const uniqueFilters =
            xAxis === yAxis ? [{ field: xAxis, value: xValue }] : filters;

          this.chartClick.emit({
            chartId: chart.childId || '',
            filters: uniqueFilters,
          });
        });
      });
    }
  }
}
