import {
  Component,
  Input,
  OnChanges,
  OnInit,
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
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-table',
  imports: [AgGridAngular, MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit, OnChanges {
  @Input() rowData: any[] | null = [];
  @Input() columnDefs: ColDef[] | null = [];
  @Input() defaultColDef: ColDef = {};

  gridApi!: GridApi;

  activeFilters: { colId: string; value: any }[] = [];
  colIdToHeaderName: { [key: string]: string } = {};

  myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
    ...AG_GRID_THEME,
  });

  localeText = AG_GRID_LOCALE_RU;

  ngOnInit() {}

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

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.syncFiltersWithColumns();
  }

  columnEverythingChanged(): void {
    this.syncFiltersWithColumns();
  }

  async removeFilter(colId: string): Promise<void> {
    const filterInstance = await this.gridApi.getColumnFilterInstance(colId);

    if (filterInstance?.setModel) {
      filterInstance.setModel(null);
      this.gridApi.onFilterChanged();
      this.updateActiveFilters();
    }
  }

  updateActiveFilters() {
    const model = this.gridApi.getFilterModel();
    this.activeFilters = Object.entries(model).map(([colId, filter]) => ({
      colId,
      value: filter?.filter ?? '',
    }));
  }

  async onCellClicked(event: any): Promise<void> {
    const columnField = event.colDef.field;
    const cellValue = event.value;

    if (!columnField || cellValue === undefined || cellValue === null) return;

    const filterInstance = await this.gridApi.getColumnFilterInstance(
      columnField
    );

    if (filterInstance?.setModel) {
      filterInstance.setModel({
        type: 'equals',
        filter: cellValue,
      });
      this.gridApi.onFilterChanged();
      this.updateActiveFilters();
    }
  }

  resetAllFilters(): void {
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
    this.activeFilters = [];
  }
}
