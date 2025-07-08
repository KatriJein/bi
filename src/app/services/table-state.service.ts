import { inject, Injectable } from '@angular/core';
import { DatasetsActions, DatasetsSelectors } from '../core/store/datasets';
import { ChartService } from '../core/api/services';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Column, Dataset } from '../core/models';
import { ChartDto, ChartsActions, ChartsSelectors, ChartType } from '../core/store/charts';
import { FilterColumn } from '.';
import {
  collectAllColumns,
  createChartDataRequests,
  findColumnByName,
  findColumnsByNames,
  groupColumnsByTable,
  processChartData,
} from '../utils';
import { ExtendedColumn } from '../components/chart';
import { from } from 'arquero';
import { Location } from '@angular/common';

export type ColumnKey =
  | 'tableColumns'
  | 'filters'
  | 'sorting'
  | 'dimensions'
  | 'measures';

@Injectable({
  providedIn: 'root',
})
export class TablePageStateService {
  private store = inject(Store);
  private tableService = inject(ChartService);
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

  // Текущая таблица
  private tableSubject = new BehaviorSubject<ChartDto | null>(null);
  table$ = this.tableSubject.asObservable();

  // Все колонки
  private columnsSubject = new BehaviorSubject<Column[]>([]);
  allColumns$ = this.columnsSubject.asObservable();

  // Состояние колонок измерения и показатели
  private dimensionsSubject = new BehaviorSubject<Column[]>([]);
  dimensions$ = this.dimensionsSubject.asObservable();

  private measuresSubject = new BehaviorSubject<Column[]>([]);
  measures$ = this.measuresSubject.asObservable();

  // Состояние для колонок
  private tableColumnsSubject = new BehaviorSubject<Column[]>([]);
  tableColumns$ = this.tableColumnsSubject.asObservable();

  private filtersSubject = new BehaviorSubject<FilterColumn[]>([]);
  filters$ = this.filtersSubject.asObservable();

  private sortingSubject = new BehaviorSubject<Column[]>([]);
  sorting$ = this.sortingSubject.asObservable();

  // Данные для таблицы
  chartData$: Observable<any[]> = this.table$.pipe(
    filter(
      (table): table is ChartDto =>
        !!table && Array.isArray(table.yAxis) && table.yAxis.length > 0
    ),

    switchMap((table) =>
      combineLatest([
        this.selectedDataset$.pipe(filter((d): d is Dataset => d !== null)),
        this.tableColumns$.pipe(take(1)),
        this.sorting$.pipe(take(1)),
        this.filters$.pipe(take(1)),
      ]).pipe(
        switchMap(([dataset, tableCols, sortingCols, filterCols]) => {
          const tableColumns = tableCols.filter((c) =>
            table.yAxis?.includes(c.columnName)
          );

          const filtersColumns: FilterColumn[] =
            table.filters
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

          const sortingColumns = (table.sorting ?? [])
            .map((s) => {
              const col = sortingCols.find(
                (c) => c.columnName === s.columnName
              );
              if (!col) return null;
              return { ...col, direction: s.direction };
            })
            .filter((c): c is Column & { direction: 'asc' | 'desc' } => !!c);

          const allCols = collectAllColumns(
            null,
            tableColumns,
            filtersColumns,
            sortingColumns
          );

          const colsByTable = groupColumnsByTable(allCols);

          const requests = createChartDataRequests(
            colsByTable,
            this.tableService
          );

          if (requests.length === 0) {
            return of([]);
          }

          return requests.length === 1
            ? requests[0].pipe(
                map(({ data }) => {
                  const aggregated = processChartData(
                    data,
                    '',
                    tableColumns,
                    sortingColumns,
                    filtersColumns
                  );
                  return aggregated;
                })
              )
            : combineLatest(requests).pipe(
                map((results) => {
                  const merged = results.flatMap((r) => r.data);
                  return from(merged).objects();
                })
              );
        })
      )
    )
  );

  // Выбор датасета
  setSelectedDatasetId(id: string | null) {
    this.tableColumnsSubject.next([]);
    this.sortingSubject.next([]);
    this.filtersSubject.next([]);

    this.updateChartField('yAxis', []);
    this.updateChartField('sorting', []);
    this.updateChartField('filters', []);

    this.selectedDatasetIdSubject.next(id);

    if (id) {
      this.updateChartField('datasetId', id);
    }
  }

  // Создание новой таблицы
  createNewTable(datasetId: string | null = null) {
    const newTable: ChartDto = {
      name: 'Новая таблица',
      id: null,
      datasetId: datasetId ?? null,
      xAxis: null,
      yAxis: null,
      filters: null,
      sorting: null,
      settings: null,
    };

    this.tableSubject.next(newTable);
    this.tableColumnsSubject.next([]);
    this.sortingSubject.next([]);
    this.filtersSubject.next([]);
    this.setSelectedDatasetId(datasetId);
  }

  // Обновление колонок
  updateColumns(key: ColumnKey, value: ExtendedColumn[]) {
    if (key === 'dimensions' || key === 'measures') return;

    const subject = this.getSubjectByKey(key);
    subject.next(value);

    if (key === 'tableColumns') {
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
    const table = this.tableSubject.getValue();
    if (!table) return;

    const updatedTable = { ...table, [key]: value };
    this.tableSubject.next(updatedTable);
  }

  // Обновление поля настроек графика
  updateChartSettings<K extends keyof NonNullable<ChartDto['settings']>>(
    key: K,
    value: NonNullable<ChartDto['settings']>[K]
  ) {
    const table = this.tableSubject.getValue();
    if (!table) return;

    const updatedTable = {
      ...table,
      settings: { ...table.settings, [key]: value },
    };
    this.tableSubject.next(updatedTable);
  }

  // Получение текущего графика
  getCurrentTable(): ChartDto | null {
    return this.tableSubject.getValue();
  }

  // Получение субъекта колонки по ключу
  getSubjectByKey(key: ColumnKey): BehaviorSubject<ExtendedColumn[]> {
    switch (key) {
      case 'dimensions':
        return this.dimensionsSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'measures':
        return this.measuresSubject as BehaviorSubject<ExtendedColumn[]>;
      case 'tableColumns':
        return this.tableColumnsSubject as BehaviorSubject<ExtendedColumn[]>;
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
  loadTableFromStore(id: string) {
    this.store
      .select(ChartsSelectors.selectChartById(id))
      .pipe(
        filter((table): table is ChartDto => !!table),
        tap((table) => {
          this.tableSubject.next(table);
          this.setSelectedDatasetId(table.datasetId);
          const type = table.settings?.chartType as ChartType;
        }),
        switchMap((table) =>
          this.selectedDataset$.pipe(
            filter((dataset): dataset is Dataset => dataset !== null),
            take(1),
            tap((dataset) => {
              const tableColumns = Array.isArray(table.yAxis)
                ? findColumnsByNames(table.yAxis, dataset)
                : [];

              let sorting: Column[] | null = null;

              if (table.sorting?.length) {
                const sortingColumns = findColumnsByNames(
                  table.sorting.map((s) => s.columnName),
                  dataset
                );

                sorting = sortingColumns.map((col) => {
                  const original = table.sorting!.find(
                    (s) => s.columnName === col.columnName
                  );
                  return {
                    ...col,
                    direction: original?.direction || 'asc',
                  };
                });
              }

              let filters: FilterColumn[] = [];

              if (Array.isArray(table.filters)) {
                filters = table.filters
                  .map((f) => {
                    const column = findColumnByName(f.columnName, dataset);
                    if (column) {
                      return {
                        ...column,
                        value: f.value,
                        filterType: f.filterType,
                      } as FilterColumn;
                    }
                    return null;
                  })
                  .filter((c): c is FilterColumn => !!c);
              }

              if (tableColumns.length) {
                this.tableColumnsSubject.next(tableColumns);
                this.updateColumns('tableColumns', tableColumns);
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

  // Сохранение таблицы
  saveTable(): void {
    const table = this.tableSubject.getValue();

    if (!table || !table.datasetId || !table.yAxis?.length) {
      console.error('Table is not complete');
      return;
    }

    this.store.dispatch(
      ChartsActions.createChart({
        chart: {
          name: table.name || 'Новая таблица',
          datasetId: table.datasetId,
          xAxis: '',
          yAxis: table.yAxis,
          filters: table.filters ?? null,
          sorting: table.sorting ?? null,
          settings: {
            ...(table.settings ?? {}),
            chartType: 'table',
          },
          id: null,
        },
      })
    );

    this.actions$
      .pipe(ofType(ChartsActions.createChartSuccess), take(1))
      .subscribe(({ chart }) => {
        this.tableSubject.next(chart);
        this.router.navigate(['/table', chart.id]);
      });
  }

  // Обновление графика
  updateTable(): void {
    const table = this.tableSubject.getValue();

    if (!table || !table.id || !table.datasetId || !table.yAxis?.length) {
      console.error('Table is not complete or missing ID');
      return;
    }

    this.store.dispatch(
      ChartsActions.updateChart({
        chart: {
          id: table.id,
          name: table.name,
          datasetId: table.datasetId,
          xAxis: '',
          yAxis: table.yAxis,
          filters: table.filters ?? null,
          sorting: table.sorting ?? null,
          settings: {
            ...(table.settings ?? {}),
            chartType: 'table',
          },
        },
      })
    );
  }

  // Удаление графика
  deleteTable(id: string): void {
    this.store.dispatch(ChartsActions.deleteChart({ id }));

    this.actions$
      .pipe(
        ofType(ChartsActions.deleteChartSuccess),
        filter((action) => action.id === id),
        take(1)
      )
      .subscribe(() => {
        this.tableSubject.next(null);
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
