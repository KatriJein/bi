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
import { toCamelCase } from '../../../core/utils';
import { parseDateFromAnyFormat } from '../../../utils';

ModuleRegistry.registerModules([AllCommunityModule, DateFilterModule]);

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

  @Output() cellDoubleClicked = new EventEmitter<FilterTypeExp>();

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent): void {
    if (!this.isEventInsideGrid(event)) {
      return;
    }
    event.preventDefault();
  }

  private isEventInsideGrid(event: MouseEvent): boolean {
    const gridElement = document.querySelector('ag-grid-angular');
    return gridElement?.contains(event.target as Node) ?? false;
  }

  gridApi!: GridApi;
  private isGridReady = false;
  private pendingFilters: FilterTypeExp[] | null = null;

  activeFilters: { colId: string; value: any }[] = [];
  colIdToHeaderName: { [key: string]: string } = {};

  myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
    ...AG_GRID_THEME,
  });

  localeText = AG_GRID_LOCALE_RU;

  private clickSubject = new Subject<{ field: string; value: any } | null>();
  private clickSubscription: Subscription;

  constructor() {
    this.clickSubscription = this.clickSubject
      .pipe(
        debounceTime(300),
        filter((cell) => cell !== null)
      )
      .subscribe(async (cell) => {
        await this.applyFilterAppending(cell.field, cell.value);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] && this.columnDefs) {
      this.colIdToHeaderName = this.columnDefs.reduce((acc, col) => {
        if (col.field) {
          acc[col.field] = col.headerName ?? col.field;
        }
        return acc;
      }, {} as { [key: string]: string });

      this.syncFiltersWithColumns();
    }

    if (changes['initialFilters'] && this.gridApi && this.initialFilters) {
      this.applyFiltersReplacingAll(this.initialFilters);
    }

    if (changes['rowData'] && this.gridApi && this.initialFilters) {
      this.applyFiltersReplacingAll(this.initialFilters);
    }
  }

  columnEverythingChanged(): void {
    this.syncFiltersWithColumns();
  }

  ngOnDestroy() {
    this.clickSubscription.unsubscribe();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.isGridReady = true;

    this.pendingFilters
      ? this.applyFiltersReplacingAll(this.pendingFilters)
      : this.applyInitialFilters();

    this.pendingFilters = null;
    this.syncFiltersWithColumns();
  }

  async onCellClicked(event: any): Promise<void> {
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

    if (this.gridApi && this.isGridReady) {
      await this.applyFiltersReplacingAll(this.initialFilters);
    } else {
      this.pendingFilters = [...this.initialFilters];
    }
  }

  private async applyFiltersReplacingAll(
    filters: FilterTypeExp[]
  ): Promise<void> {
    if (!filters || filters.length === 0) {
      this.clearAllFilters();
      return;
    }

    if (!this.gridApi) {
      this.pendingFilters = [...filters];
      return;
    }

    try {
      this.clearAllFilters();
      const availableColumns = this.gridApi.getColumnDefs() as ColDef[];
      const availableFields = new Set(
        availableColumns.map((col) => col.field).filter(Boolean)
      );

      const filterPromises = filters.map(async (filter) => {
        const camelCaseField = toCamelCase(filter.field);

        if (!availableFields.has(camelCaseField)) {
          return;
        }

        try {
          const filterInstance = await this.gridApi.getColumnFilterInstance(
            camelCaseField
          );
          if (!filterInstance?.setModel) return;

          const colDef = this.gridApi.getColumnDef(camelCaseField);
          const isDateColumn = colDef?.filter === 'agDateColumnFilter';

          if (isDateColumn) {
            const date = parseDateFromAnyFormat(filter.value);
            if (!date) return;

            const utcDate = new Date(
              Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
            );

            filterInstance.setModel({
              type: 'equals',
              dateFrom: utcDate.toISOString(),
              dateTo: new Date(utcDate.getTime() + 86400000 - 1).toISOString(),
            });
          } else {
            filterInstance.setModel({
              type: 'equals',
              filter: filter.value,
            });
          }
        } catch (error) {
          console.error(
            `Ошибка при установке фильтра для ${camelCaseField}:`,
            error
          );
        }
      });

      await Promise.all(filterPromises);
      this.gridApi.onFilterChanged();
      this.updateActiveFilters();
    } catch (error) {
      console.error('Error applying filters:', error);
      this.pendingFilters = [...filters];
    }
  }

  private async applyFilterAppending(field: string, value: any): Promise<void> {
    if (!this.gridApi) {
      this.pendingFilters = [{ field, value }];
      return;
    }

    try {
      const filterInstance = await this.gridApi.getColumnFilterInstance(field);
      if (filterInstance?.setModel) {
        const colDef = this.gridApi.getColumnDef(field);
        const isDateColumn = colDef?.filter === 'agDateColumnFilter';

        if (isDateColumn) {
          const date = parseDateFromAnyFormat(value);
          if (!date) return;

          const utcDate = new Date(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
          );

          filterInstance.setModel({
            type: 'equals',
            dateFrom: utcDate.toISOString(),
            dateTo: new Date(utcDate.getTime() + 86400000 - 1).toISOString(),
          });
        } else {
          filterInstance.setModel({
            type: 'equals',
            filter: value,
          });
        }

        this.gridApi.onFilterChanged();
        this.updateActiveFilters();
      }
    } catch (error) {
      console.error('Error applying filter (appending):', error);
      this.pendingFilters = [{ field, value }];
    }
  }

  async removeFilter(colId: string): Promise<void> {
    const filterInstance = await this.gridApi.getColumnFilterInstance(colId);
    filterInstance?.setModel?.(null);

    this.gridApi.onFilterChanged();
    this.updateActiveFilters();
  }

  clearAllFilters(): void {
    if (!this.gridApi) return;

    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
    this.activeFilters = [];
  }

  private updateActiveFilters() {
    if (!this.gridApi) return;

    const model = this.gridApi.getFilterModel();

    this.activeFilters = Object.keys(model).map((colId) => {
      const filter = model[colId];
      const colDef = this.gridApi.getColumnDef(colId);
      const isDateColumn = colDef?.filter === 'agDateColumnFilter';

      let displayValue = '';

      if (isDateColumn) {
        const dateStr = filter.dateFrom || filter.filter;
        if (dateStr) {
          const date = new Date(dateStr);
          const day = date.getUTCDate().toString().padStart(2, '0');
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          const year = date.getUTCFullYear();
          displayValue = `${day}.${month}.${year}`;
        }
      } else {
        displayValue = filter.filter?.toString() || '';
      }

      return {
        colId,
        value: displayValue,
      };
    });
  }

  private syncFiltersWithColumns(): void {
    if (!this.gridApi) return;
    const columns = this.gridApi.getColumnDefs() as ColDef[];
    const allowedFields = new Set(
      (columns || []).map((col) => col.field).filter(Boolean) as string[]
    );
    const currentFilterModel = this.gridApi.getFilterModel();

    const newFilterModel = Object.entries(currentFilterModel).reduce(
      (acc, [colId, filter]) => {
        if (allowedFields.has(colId)) acc[colId] = filter;
        return acc;
      },
      {} as { [key: string]: any }
    );

    this.gridApi.setFilterModel(newFilterModel);
    this.gridApi.onFilterChanged();
    this.updateActiveFilters();
  }
}
