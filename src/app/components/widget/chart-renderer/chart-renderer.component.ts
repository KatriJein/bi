import {
  Component,
  inject,
  Input,
  OnChanges,
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
  processChartData,
} from '../../../utils';
import { Column } from '../../../core/models';
import { ChartService } from '../../../core/api/services';

@Component({
  selector: 'app-chart-renderer',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-renderer.component.html',
  styleUrl: './chart-renderer.component.scss',
})
export class ChartRendererComponent implements OnChanges {
  private store = inject(Store);
  private chartService = inject(ChartService);
  @Input() chartId!: string;

  private chartSubject = new BehaviorSubject<ChartDto | null>(null);
  private datasetSubject = new BehaviorSubject<DatasetDto | null>(null);

  chart$ = this.chartSubject.asObservable();
  dataset$ = this.datasetSubject.asObservable();

  chartData: ChartConfiguration['data'] | undefined = undefined;
  chartOptions: ChartConfiguration['options'] | undefined = undefined;
  chartType: ChartConfiguration['type'] = 'line';

  private sub?: Subscription;

  chartData$: Observable<any> = this.chart$.pipe(
    filter((chart): chart is ChartDto => !!chart),
    switchMap((chart) =>
      combineLatest([
        this.dataset$.pipe(filter((d): d is DatasetDto => d !== null)),
        of(chart),
      ]).pipe(
        switchMap(([dataset, chart]) => {
          const xAxisColumn = chart.xAxis
            ? findColumnByName(chart.xAxis, dataset)
            : null;

          const yAxisColumns = Array.isArray(chart.yAxis)
            ? findColumnsByNames(chart.yAxis, dataset)
            : [];

          const filtersColumns: FilterColumn[] =
            chart.filters
              ?.map((f) => {
                const baseCol = findColumnByName(f.columnName, dataset);
                if (!baseCol) return null;
                return {
                  ...baseCol,
                  filterType: f.filterType,
                  value: f.value,
                };
              })
              .filter((x): x is FilterColumn => x !== null) ?? [];

          const sortingColumns = Array.isArray(chart.sorting)
            ? findColumnsByNames(
                chart.sorting.map((s) => s.columnName),
                dataset
              )
                .map((col) => {
                  const sortingItem = chart.sorting!.find(
                    (s) => s.columnName === col.columnName
                  );
                  if (!sortingItem) return null;
                  return {
                    ...col,
                    direction: sortingItem.direction,
                  };
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

          const requests = createChartDataRequests(
            colsByTable,
            this.chartService
          );

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
      )
    )
  );

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('chartId' in changes && this.chartId) {
      this.store
        .pipe(select(ChartsSelectors.selectChartById(this.chartId)), take(1))
        .subscribe((chart) => {
          this.chartSubject.next(chart ?? null);

          if (
            chart?.settings?.chartType &&
            chart.settings.chartType !== 'table'
          ) {
            this.chartType =
              chart.settings.chartType === 'horizontalBar'
                ? 'bar'
                : chart.settings.chartType;
          }

          if (chart?.datasetId) {
            this.store
              .pipe(
                select(DatasetsSelectors.selectDatasetById(chart.datasetId)),
                take(1)
              )
              .subscribe((dataset) => {
                this.datasetSubject.next(dataset ?? null);
              });
          } else {
            console.warn('[ChartRenderer] No datasetId in chart');
            this.datasetSubject.next(null);
          }
        });

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
              this.chartType,
              chart.settings?.colors
            );
            this.chartOptions = buildChartOptions(
              xAxis.filter((col): col is Column => col !== null),
              yAxis,
              this.chartType
            );
          });
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
