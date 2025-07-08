import { inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {
  BehaviorSubject,
  Observable,
  map,
  switchMap,
  distinctUntilChanged,
  filter,
  tap,
  take,
  combineLatest,
  of,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { Column, Dataset } from '../core/models';
import { DatasetsActions, DatasetsSelectors } from '../core/store/datasets';
import { ChartService } from '../core/api/services/chart.service';
import {
  ChartDto,
  ChartsActions,
  ChartsSelectors,
  ChartType,
} from '../core/store/charts';
import {
  ColumnKey,
  ExtendedColumn,
} from '../components/chart/data-selection/data-selection.component';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import {
  collectAllColumns,
  createChartDataRequests,
  findColumnByName,
  findColumnsByNames,
  groupColumnsByTable,
  processChartData,
} from '../utils';
import { COLORS } from '../constants';

export type AggregateType = 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN' | 'NONE';

export type ColumnWithExtras<T = {}> = Column & T;
export type FilterColumn = ColumnWithExtras<{
  filterType: string;
  value: any;
}>;

@Injectable({ providedIn: 'root' })
export class ChartPageStateService {
  private store = inject(Store);
  private chartService = inject(ChartService);
  private router = inject(Router);
  private actions$ = inject(Actions);
  private location = inject(Location);

  // Список датасетов для выбора
  datasets$: Observable<Dataset[]> = this.store.select(
    DatasetsSelectors.selectDatasets
  );

  // Выбранный датасет
  private selectedDatasetIdSubject = new BehaviorSubject<string | null>(null);
  selectedDatasetId$ = this.selectedDatasetIdSubject.asObservable();

  selectedDataset$: Observable<Dataset | null> = this.selectedDatasetId$.pipe(
    distinctUntilChanged(),
    filter((id): id is string => id !== null),
    switchMap((id) =>
      this.store
        .select(DatasetsSelectors.selectDatasetById(id))
        .pipe(map((dataset) => dataset ?? null))
    )
  );

  // Текущий график
  private chartSubject = new BehaviorSubject<ChartDto | null>(null);
  chart$ = this.chartSubject.asObservable();

  // Тип графика
  private chartTypeSubject = new BehaviorSubject<ChartType>('line');
  chartType$ = this.chartTypeSubject.asObservable();

  // Все колонки
  private columnsSubject = new BehaviorSubject<Column[]>([]);
  allColumns$ = this.columnsSubject.asObservable();

  // Состояние колонок измерения и показатели
  private dimensionsSubject = new BehaviorSubject<Column[]>([]);
  dimensions$ = this.dimensionsSubject.asObservable();

  private measuresSubject = new BehaviorSubject<Column[]>([]);
  measures$ = this.measuresSubject.asObservable();

  // Состояние для колонок
  private xAxisSubject = new BehaviorSubject<Column[]>([]);
  xAxis$ = this.xAxisSubject.asObservable();

  private yAxisSubject = new BehaviorSubject<Column[]>([]);
  yAxis$ = this.yAxisSubject.asObservable();

  private filtersSubject = new BehaviorSubject<FilterColumn[]>([]);
  filters$ = this.filtersSubject.asObservable();

  private sortingSubject = new BehaviorSubject<Column[]>([]);
  sorting$ = this.sortingSubject.asObservable();

  colorSettings$ = this.chart$.pipe(
    map((chart) => {
      const colors = chart?.settings?.colors;
      return colors && colors.length > 0 ? colors : COLORS;
    })
  );

  setColorSettings(settings: string[]) {
    this.updateChartSettings('colors', settings);
  }

  // Данные для графика
  chartData$: Observable<any[]> = this.chart$.pipe(
    filter(
      (chart): chart is ChartDto =>
        !!chart &&
        !!chart.xAxis &&
        Array.isArray(chart.yAxis) &&
        chart.yAxis.length > 0
    ),
    switchMap((chart) =>
      combineLatest([
        this.selectedDataset$.pipe(filter((d): d is Dataset => d !== null)),
        this.xAxis$.pipe(take(1)),
        this.yAxis$.pipe(take(1)),
        this.sorting$.pipe(take(1)),
        this.filters$.pipe(take(1)),
      ]).pipe(
        switchMap(
          ([dataset, xAxisCols, yAxisCols, sortingCols, filterCols]) => {
            const xAxisColumn = xAxisCols.find(
              (c) => c.columnName === chart.xAxis
            );

            const yAxisColumns = yAxisCols.filter((c) =>
              chart.yAxis?.includes(c.columnName)
            );

            const filtersColumns: FilterColumn[] =
              chart.filters
                ?.map((f) => {
                  const baseCol = filterCols.find(
                    (c) => c.columnName === f.columnName
                  );
                  if (!baseCol) return null;
                  return {
                    ...baseCol,
                    filterType: f.filterType,
                    value: f.value,
                  };
                })
                .filter((x): x is FilterColumn => x !== null) ?? [];

            const sortingColumns = (chart.sorting ?? [])
              .map((s) => {
                const col = sortingCols.find(
                  (c) => c.columnName === s.columnName
                );
                if (!col) return null;
                return { ...col, direction: s.direction };
              })
              .filter((c): c is Column & { direction: 'asc' | 'desc' } => !!c);

            const allCols = collectAllColumns(
              xAxisColumn ?? null,
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
          }
        )
      )
    )
  );

  // Выбор датасета
  setSelectedDatasetId(id: string | null) {
    this.xAxisSubject.next([]);
    this.yAxisSubject.next([]);
    this.sortingSubject.next([]);
    this.filtersSubject.next([]);
    this.updateChartField('xAxis', null);
    this.updateChartField('yAxis', []);
    this.updateChartField('sorting', []);
    this.updateChartField('filters', []);

    this.selectedDatasetIdSubject.next(id);

    if (id) {
      this.updateChartField('datasetId', id);
    }
  }

  // Создание нового графика
  createNewChart(datasetId: string | null = null) {
    const newChart: ChartDto = {
      name: 'Новый график',
      id: null,
      datasetId: datasetId ?? null,
      xAxis: null,
      yAxis: null,
      filters: null,
      sorting: null,
      settings: null,
    };
    this.setChart(newChart);
    this.xAxisSubject.next([]);
    this.yAxisSubject.next([]);
    this.sortingSubject.next([]);
    this.filtersSubject.next([]);
    this.setSelectedDatasetId(datasetId);
  }

  // Обновление колонок
  updateColumns(key: ColumnKey, value: ExtendedColumn[]) {
    if (key === 'dimensions' || key === 'measures') return;

    const subject = this.getSubjectByKey(key);
    subject.next(value);

    if (key === 'xAxis') {
      this.updateChartField('xAxis', value[0]?.columnName || null);
    } else if (key === 'yAxis') {
      this.updateChartField(
        'yAxis',
        value.map((col) => col.columnName)
      );
    } else if (key === 'sorting') {
      this.updateChartField(
        'sorting',
        value
          .filter(
            (col): col is Column & { direction: 'asc' | 'desc' } =>
              !!col.direction
          )
          .map((col) => ({
            columnName: col.columnName,
            direction: col.direction,
          }))
      );
    } else if (key === 'filters') {
      this.updateChartField(
        'filters',
        value
          .filter(
            (col): col is FilterColumn => 'value' in col && 'filterType' in col
          )
          .map((col) => ({
            columnName: col.columnName,
            filterType: col.filterType,
            value: col.value,
          }))
      );
    }
  }

  // Обновление поля графика
  updateChartField<K extends keyof ChartDto>(key: K, value: ChartDto[K]) {
    const chart = this.chartSubject.getValue();
    if (!chart) return;

    const updatedChart = { ...chart, [key]: value };
    this.chartSubject.next(updatedChart);
  }

  // Обновление поля настроек графика
  updateChartSettings<K extends keyof NonNullable<ChartDto['settings']>>(
    key: K,
    value: NonNullable<ChartDto['settings']>[K]
  ) {
    const chart = this.chartSubject.getValue();
    if (!chart) return;

    const updatedChart = {
      ...chart,
      settings: { ...chart.settings, [key]: value },
    };
    this.chartSubject.next(updatedChart);
  }

  // Установка графика
  setChart(chart: ChartDto) {
    this.chartSubject.next(chart);
  }

  // Установка типа графика
  setChartType(type: ChartType) {
    this.chartTypeSubject.next(type);
    const chart = this.chartSubject.getValue();
    if (!chart) return;

    const updatedSettings = {
      ...(chart.settings ?? {}),
      chartType: type,
    };

    this.updateChartField('settings', updatedSettings);
  }

  // Получение текущего графика типа
  getChartType(): ChartType {
    return this.chartTypeSubject.getValue();
  }

  // Получение текущего графика
  getCurrentChart(): ChartDto | null {
    return this.chartSubject.getValue();
  }

  // Получение субъекта колонки по ключу
  getSubjectByKey(key: ColumnKey): BehaviorSubject<ExtendedColumn[]> {
    switch (key) {
      case 'dimensions':
        return this.dimensionsSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'measures':
        return this.measuresSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'xAxis':
        return this.xAxisSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'yAxis':
        return this.yAxisSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'filters':
        return this.filtersSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'sorting':
        return this.sortingSubject as BehaviorSubject<ExtendedColumn[]>;
      default:
        throw new Error(`Unknown column key: ${key}`);
    }
  }

  /* Действия с store */

  // Загрузка графика из store
  loadChartFromStore(id: string) {
    this.store
      .select(ChartsSelectors.selectChartById(id))
      .pipe(
        filter((chart): chart is ChartDto => !!chart),
        tap((chart) => {
          this.setChart(chart);
          this.setSelectedDatasetId(chart.datasetId);
          const type = chart.settings?.chartType as ChartType;
          if (type) {
            this.chartTypeSubject.next(type);
          }
        }),
        switchMap((chart) =>
          this.selectedDataset$.pipe(
            filter((dataset): dataset is Dataset => dataset !== null),
            take(1),
            tap((dataset) => {
              const xAxis = chart.xAxis
                ? findColumnByName(chart.xAxis, dataset)
                : null;

              const yAxis = Array.isArray(chart.yAxis)
                ? findColumnsByNames(chart.yAxis, dataset)
                : [];

              let sorting: Column[] | null = null;

              if (chart.sorting?.length) {
                const sortingColumns = findColumnsByNames(
                  chart.sorting.map((s) => s.columnName),
                  dataset
                );

                sorting = sortingColumns.map((col) => {
                  const original = chart.sorting!.find(
                    (s) => s.columnName === col.columnName
                  );
                  return {
                    ...col,
                    direction: original?.direction || 'asc',
                  };
                });
              }

              let filters: FilterColumn[] = [];

              if (Array.isArray(chart.filters)) {
                filters = chart.filters
                  .map((f) => {
                    const column = findColumnByName(f.columnName, dataset);
                    if (column) {
                      return {
                        ...column,
                        value: f.value,
                        filterType: f.filterType,
                      } satisfies FilterColumn;
                    }
                    return null;
                  })
                  .filter((c): c is FilterColumn => !!c);
              }

              if (xAxis) {
                this.xAxisSubject.next([xAxis]);
                this.updateColumns('xAxis', [xAxis]);
              }

              if (yAxis.length) {
                this.yAxisSubject.next(yAxis);
                this.updateColumns('yAxis', yAxis);
              }

              if (sorting?.length) {
                this.sortingSubject.next(sorting);
                this.updateColumns('sorting', sorting);
              }

              if (filters.length) {
                this.filtersSubject.next(filters);
                this.updateColumns('filters', filters);
              }
            })
          )
        )
      )
      .subscribe();
  }

  // Сохранение графика
  saveChart(): void {
    const chart = this.chartSubject.getValue();

    if (!chart || !chart.datasetId || !chart.xAxis || !chart.yAxis?.length) {
      console.error('Chart is not complete');
      return;
    }

    this.store.dispatch(
      ChartsActions.createChart({
        chart: {
          name: chart.name || 'Новый график',
          datasetId: chart.datasetId,
          xAxis: chart.xAxis,
          yAxis: chart.yAxis,
          filters: chart.filters ?? null,
          sorting: chart.sorting ?? null,
          settings: {
            ...(chart.settings ?? {}),
            chartType: this.getChartType(),
          },
          id: null,
        },
      })
    );

    this.actions$
      .pipe(ofType(ChartsActions.createChartSuccess), take(1))
      .subscribe(({ chart }) => {
        this.setChart(chart);
        this.router.navigate(['/chart', chart.id]);
      });
  }

  // Обновление графика
  updateChart(): void {
    const chart = this.chartSubject.getValue();

    if (
      !chart ||
      !chart.id ||
      !chart.datasetId ||
      !chart.xAxis ||
      !chart.yAxis?.length
    ) {
      console.error('Chart is not complete or missing ID');
      return;
    }

    this.store.dispatch(
      ChartsActions.updateChart({
        chart: {
          id: chart.id,
          name: chart.name,
          datasetId: chart.datasetId,
          xAxis: chart.xAxis,
          yAxis: chart.yAxis,
          filters: chart.filters ?? null,
          sorting: chart.sorting ?? null,
          settings: {
            ...(chart.settings ?? {}),
            chartType: this.getChartType(),
          },
        },
      })
    );
  }

  // Удаление графика
  deleteChart(id: string): void {
    this.store.dispatch(ChartsActions.deleteChart({ id }));

    this.actions$
      .pipe(
        ofType(ChartsActions.deleteChartSuccess),
        filter((action) => action.id === id),
        take(1)
      )
      .subscribe(() => {
        this.chartSubject.next(null);
        this.location.back();
      });
  }

  constructor() {
    this.store.dispatch(DatasetsActions.loadDatasets());

    this.selectedDataset$.subscribe((dataset) => {
      const cols = dataset?.columns?.filter((c) => c.isVisible) ?? [];
      this.columnsSubject.next(cols);
      this.dimensionsSubject.next(cols.filter((c) => c.aggregate === 'NONE'));
      this.measuresSubject.next(cols.filter((c) => c.aggregate !== 'NONE'));
    });
  }
}
