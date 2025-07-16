import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ChartDto, ChartsSelectors } from '../../../core/store/charts';
import { DatasetDto, DatasetsSelectors } from '../../../core/store/datasets';
import { Chart } from 'chart.js';
import { ChartService } from '../../../core/api/services';
import {
  collectAllColumns,
  createChartDataRequests,
  findColumnByName,
  findColumnsByNames,
  groupColumnsByTable,
  processChartData,
} from '../../../utils';
import { FilterColumn } from '../../../services';
import { Column } from '../../../core/models';
import { ColDef } from 'ag-grid-community';
import { toCamelCase } from '../../../core/utils';
import { getAgGridFilterType } from '../../../constants';
import { TableComponent } from '../../table/table/table.component';
import { CommonModule } from '@angular/common';
import { FilterEmitType, FilterTypeExp } from '../../../pages';

@Component({
  selector: 'app-table-renderer',
  imports: [TableComponent, CommonModule],
  templateUrl: './table-renderer.component.html',
  styleUrl: './table-renderer.component.scss',
})
export class TableRendererComponent implements OnChanges {
  private store = inject(Store);
  private tableService = inject(ChartService);
  @Input() tableId!: string;
  @Input() initialFilters?: FilterTypeExp[] | null;
  @Output() tableDoubleClick = new EventEmitter<FilterEmitType>();

  onTableDoubleClick(event: FilterTypeExp): void {
    if (!this.tableSubject.value?.childId) {
      console.error('Child chart ID is missing');
      return;
    }

    this.tableDoubleClick.emit({
      chartId: this.tableSubject.value.childId,
      filters: [{ field: event.field, value: event.value }],
    });
  }

  private tableSubject = new BehaviorSubject<ChartDto | null>(null);
  private datasetSubject = new BehaviorSubject<DatasetDto | null>(null);

  table$ = this.tableSubject.asObservable();
  dataset$ = this.datasetSubject.asObservable();

  tableColumns$: Observable<Column[]> = combineLatest([
    this.table$.pipe(filter((table): table is ChartDto => table !== null)),
    this.dataset$.pipe(filter((d): d is DatasetDto => d !== null)),
  ]).pipe(
    map(([table, dataset]) => {
      return findColumnsByNames(table?.yAxis || [], dataset);
    })
  );

  chartData$: Observable<any[]> = this.table$.pipe(
    filter(
      (table): table is ChartDto =>
        !!table && Array.isArray(table.yAxis) && table.yAxis.length > 0
    ),
    switchMap((table) =>
      this.dataset$.pipe(
        filter((d): d is DatasetDto => d !== null),
        switchMap((dataset) => {
          const tableColumns = findColumnsByNames(table.yAxis || [], dataset);

          const filtersColumns: FilterColumn[] = (table.filters ?? [])
            .map((f) => {
              const baseCol = findColumnByName(f.columnName, dataset);
              return baseCol
                ? { ...baseCol, filterType: f.filterType, value: f.value }
                : null;
            })
            .filter((x): x is FilterColumn => x !== null);

          const sortingColumns = (table.sorting ?? [])
            .map((s) => {
              const col = findColumnByName(s.columnName, dataset);
              return col ? { ...col, direction: s.direction } : null;
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
                  return processChartData(
                    data,
                    '',
                    tableColumns,
                    sortingColumns,
                    filtersColumns
                  );
                })
              )
            : combineLatest(requests).pipe(
                map((results) => {
                  const merged = results.flatMap((r) => r.data);
                  return processChartData(
                    merged,
                    '',
                    tableColumns,
                    sortingColumns,
                    filtersColumns
                  );
                })
              );
        })
      )
    )
  );

  colDefs$: Observable<ColDef[]> = this.tableColumns$.pipe(
    map((columns) =>
      columns.map((column) => ({
        field: toCamelCase(column.columnName),
        headerName: column.alias,
        filter: getAgGridFilterType(column.dataType),
        filterParams: {
          buttons: ['reset', 'apply'],
        },
      }))
    )
  );

  defaultColDef: ColDef = {
    flex: 1,
    floatingFilter: true,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if ('tableId' in changes && this.tableId) {
      this.store
        .pipe(select(ChartsSelectors.selectChartById(this.tableId)), take(1))
        .subscribe((table) => {
          this.tableSubject.next(table ?? null);

          if (table?.datasetId) {
            this.store
              .pipe(
                select(DatasetsSelectors.selectDatasetById(table.datasetId)),
                take(1)
              )
              .subscribe((dataset) => {
                this.datasetSubject.next(dataset ?? null);
              });
          } else {
            console.warn('[TableRenderer] No datasetId in chart');
            this.datasetSubject.next(null);
          }
        });
    }
  }
}
