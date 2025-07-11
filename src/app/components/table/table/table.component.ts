import {
  Component,
  EventEmitter,
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
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { AG_GRID_LOCALE_RU, AG_GRID_THEME } from '../../../constants';
import { debounceTime, filter, Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

ModuleRegistry.registerModules([AllCommunityModule]);

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
  @Input() initialFilter?: { field: string; value: any } | null;

  @Output() cellDoubleClicked = new EventEmitter<{
    field: string;
    value: any;
  }>();

  gridApi!: GridApi;
  private isGridReady = false;
  private pendingFilter: { field: string; value: any } | null = null;

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

    if (changes['initialFilter'] && this.gridApi) {
      this.applyFilterReplacingAll(
        this.initialFilter!.field,
        this.initialFilter!.value
      );
    }

    if (changes['rowData'] && this.gridApi && this.initialFilter) {
      this.applyFilterReplacingAll(
        this.initialFilter!.field,
        this.initialFilter!.value
      );
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

    this.pendingFilter
      ? this.applyFilterReplacingAll(
          this.pendingFilter.field,
          this.pendingFilter.value
        )
      : this.applyInitialFilter();

    this.pendingFilter = null;
    this.syncFiltersWithColumns();
  }

  async onCellClicked(event: any): Promise<void> {
    const columnField = event.colDef.field;
    const cellValue = event.value;

    if (!columnField || cellValue === undefined || cellValue === null) return;

    this.clickSubject.next({ field: columnField, value: cellValue });
  }

  onCellDoubleClicked(event: any): void {
    this.clickSubject.next(null);

    this.cellDoubleClicked.emit({
      field: event.colDef.field,
      value: event.value,
    });
  }

  private async applyInitialFilter(): Promise<void> {
    if (!this.initialFilter) return;

    if (this.gridApi && this.isGridReady) {
      const { field, value } = this.initialFilter;
      await this.applyFilterReplacingAll(field, value);
    } else {
      this.pendingFilter = this.initialFilter;
    }
  }

  private async applyFilterReplacingAll(
    field: string,
    value: any
  ): Promise<void> {
    if (!this.gridApi) {
      console.warn('Grid API not ready');
      this.pendingFilter = { field, value };
      return;
    }

    try {
      this.gridApi.setFilterModel(null);
      this.gridApi.onFilterChanged();

      const filterInstance = await this.gridApi.getColumnFilterInstance(field);
      if (filterInstance?.setModel) {
        filterInstance.setModel({
          type: 'equals',
          filter: value,
        });
        this.gridApi.onFilterChanged();
        this.updateActiveFilters();
      }
    } catch (error) {
      console.error('Error applying filter (replacing):', error);
      this.pendingFilter = { field, value };
    }
  }

  private async applyFilterAppending(field: string, value: any): Promise<void> {
    if (!this.gridApi) {
      console.warn('Grid API not ready');
      this.pendingFilter = { field, value };
      return;
    }

    try {
      const filterInstance = await this.gridApi.getColumnFilterInstance(field);
      if (filterInstance?.setModel) {
        filterInstance.setModel({
          type: 'equals',
          filter: value,
        });
        this.gridApi.onFilterChanged();
        this.updateActiveFilters();
      }
    } catch (error) {
      console.error('Error applying filter (appending):', error);
      this.pendingFilter = { field, value };
    }
  }

  async removeFilter(colId: string): Promise<void> {
    const filterInstance = await this.gridApi.getColumnFilterInstance(colId);
    filterInstance?.setModel?.(null);

    this.gridApi.onFilterChanged();
    this.updateActiveFilters();
  }

  resetAllFilters(): void {
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
    this.activeFilters = [];
  }

  private updateActiveFilters() {
    const model = this.gridApi.getFilterModel();
    this.activeFilters = Object.entries(model).map(([colId, filter]) => ({
      colId,
      value: filter?.filter ?? '',
    }));
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
