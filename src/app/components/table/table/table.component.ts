import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AllCommunityModule,
  ModuleRegistry,
  GridApi,
  themeQuartz,
  iconSetMaterial,
  ColDef,
  DateFilterModule,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { AG_GRID_LOCALE_RU, AG_GRID_THEME } from '../../../constants';
import { debounceTime, filter, Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FilterTypeExp } from '../../../pages';
import {
  formatDateWithGranularity,
  parseDateFromAnyFormat,
} from '../../../utils';
import { DateGranularity } from '../../../core/api/graphql/types';

ModuleRegistry.registerModules([AllCommunityModule, DateFilterModule]);

type ActiveFilter = {
  colId: string;
  value: string;
  dateGranularity?: DateGranularity;
};

@Component({
  selector: 'app-table',
  imports: [AgGridAngular, MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnChanges {
  @Input() rowData: any[] | null = [];
  @Input() columnDefs: ColDef[] | null = [];
  @Input() defaultColDef: ColDef = {};
  @Input() initialFilters?: FilterTypeExp[] | null;

  @Output() filterRemoved = new EventEmitter<string>();
  @Output() cellDoubleClicked = new EventEmitter<FilterTypeExp>();

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent): void {
    if (!this.isEventInsideGrid(event)) {
      return;
    }
    event.preventDefault();
  }

  onContainerContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private isEventInsideGrid(event: MouseEvent): boolean {
    const gridElement = document.querySelector('ag-grid-angular');
    return gridElement?.contains(event.target as Node) ?? false;
  }

  gridApi!: GridApi;

  activeFilters: ActiveFilter[] = [];
  colIdToHeaderName: Record<string, string> = {};

  myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
    ...AG_GRID_THEME,
  });

  readonly localeText = AG_GRID_LOCALE_RU;

  private clickSubject = new Subject<{ field: string; value: any } | null>();
  private clickSubscription: Subscription;

  constructor() {
    this.clickSubscription = this.clickSubject
      .pipe(
        debounceTime(300),
        filter((cell) => cell !== null),
      )
      .subscribe(async (cell) => {
        await this.applyFilterAppending(cell.field, cell.value);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] && this.columnDefs) {
      this.colIdToHeaderName = this.buildHeaderMap(this.columnDefs);
    }

    if (changes['initialFilters']) {
      this.applyInitialFilters();
      this.updateActiveFilters();
    }
  }
  private buildHeaderMap(columns: ColDef[]): Record<string, string> {
    return columns.reduce(
      (acc, col) => {
        if (col.field) {
          acc[col.field] = col.headerName ?? col.field;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  ngOnDestroy() {
    this.clickSubscription.unsubscribe();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;

    this.applyInitialFilters();
  }

  onCellDoubleClicked(event: any): void {
    this.clickSubject.next(null);

    this.cellDoubleClicked.emit({
      field: event.colDef.field,
      value: event.value,
    });
  }

  async onCellContextMenu(event: any): Promise<void> {
    event.event.preventDefault();

    const columnField = event.colDef.field;
    const cellValue = event.value;

    if (!columnField || cellValue === undefined || cellValue === null) return;

    const colDef = this.gridApi.getColumnDef(columnField);
    const isDateColumn = colDef?.filter === 'agDateColumnFilter';

    let filterValue = cellValue;

    if (isDateColumn) {
      const parsedDate = parseDateFromAnyFormat(cellValue);
      if (parsedDate) {
        filterValue = parsedDate.getTime();
      } else {
        return;
      }
    }

    this.clickSubject.next({
      field: columnField,
      value: filterValue,
    });
  }

  private async applyInitialFilters(): Promise<void> {
    if (!this.initialFilters || this.initialFilters.length === 0) return;

    this.updateActiveFilters();
  }

  private async applyFilterAppending(field: string, value: any): Promise<void> {
    if (!this.gridApi) {
      return;
    }

    const colDef = this.gridApi.getColumnDef(field);
    const isDateColumn = colDef?.filter === 'agDateColumnFilter';

    if (isDateColumn) {
      const date = parseDateFromAnyFormat(value);
      if (!date) {
        return;
      }

      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );

      await this.gridApi.setColumnFilterModel(field, {
        filterType: 'date',
        type: 'equals',
        dateFrom: utcDate.toISOString(),
      });
    } else {
      await this.gridApi.setColumnFilterModel(field, {
        filterType: 'text',
        type: 'equals',
        filter: value,
      });
    }

    this.gridApi.onFilterChanged();
  }

  async removeFilter(colId: string): Promise<void> {
    if (!this.gridApi) return;

    this.filterRemoved.emit(colId);
  }

  clearAllFilters(): void {
    if (!this.gridApi) return;

    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
    this.activeFilters = [];
  }

  private updateActiveFilters(): void {
    if (!this.initialFilters || this.initialFilters.length === 0) {
      this.activeFilters = [];
      return;
    }

    this.activeFilters = this.initialFilters.map((filter) => ({
      colId: filter.field,
      value: this.formatFilterValue(filter),
      dateGranularity: filter.dateGranularity,
    }));
  }

  private formatFilterValue(filter: FilterTypeExp): string {
    if (filter.dateGranularity) {
      const date = parseDateFromAnyFormat(filter.value);
      if (date) {
        return formatDateWithGranularity(date, filter.dateGranularity);
      }
    }

    return String(filter.value);
  }
}
