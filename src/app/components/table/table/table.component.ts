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

  private isEventInsideGrid(event: MouseEvent): boolean {
    const gridElement = document.querySelector('ag-grid-angular');
    return gridElement?.contains(event.target as Node) ?? false;
  }

  gridApi!: GridApi;
  // private isGridReady = false;
  // private pendingFilters: FilterTypeExp[] | null = null;

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
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['columnDefs'] && this.columnDefs) {
  //     this.colIdToHeaderName = this.columnDefs.reduce(
  //       (acc, col) => {
  //         if (col.field) {
  //           acc[col.field] = col.headerName ?? col.field;
  //         }
  //         return acc;
  //       },
  //       {} as { [key: string]: string },
  //     );
  //   }

  //   if (changes['initialFilters']) {
  //     // this.updateActiveFilters();
  //     this.applyInitialFilters();
  //     //  this.updateActiveFiltersFromInput(this.initialFilters || []);
  //   }
  // }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['columnDefs'] && this.columnDefs) {
  //     this.colIdToHeaderName = this.columnDefs.reduce(
  //       (acc, col) => {
  //         if (col.field) {
  //           acc[col.field] = col.headerName ?? col.field;
  //         }
  //         return acc;
  //       },
  //       {} as { [key: string]: string },
  //     );
  //   }

  //   if (changes['initialFilters']) {
  //     this.updateActiveFiltersFromInput(this.initialFilters || []);
  //     this.applyInitialFilters();
  //   }
  // }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['columnDefs'] && this.columnDefs) {
  //     this.colIdToHeaderName = this.columnDefs.reduce(
  //       (acc, col) => {
  //         if (col.field) {
  //           acc[col.field] = col.headerName ?? col.field;
  //         }
  //         return acc;
  //       },
  //       {} as { [key: string]: string },
  //     );
  //   }

  //   if (changes['initialFilters']) {
  //     console.log('initialFilters in app-table:', this.initialFilters);
  //     this.activeFilters = (this.initialFilters || []).map((filter) => ({
  //       colId: toCamelCase(filter.field),
  //       value: this.formatFilterValue(filter),
  //       dateGranularity: filter.dateGranularity,
  //     }));

  //     this.applyInitialFilters();
  //     console.log('activeFilters in app-table:', this.activeFilters);
  //   }
  // }

  ngOnDestroy() {
    this.clickSubscription.unsubscribe();
  }

  // onGridReady(params: any): void {
  //   this.gridApi = params.api;
  //   this.isGridReady = true;
  //   this.updateActiveFilters();
  // }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    // this.isGridReady = true;

    // if (this.pendingFilters?.length) {
    //   this.applyFiltersReplacingAll(this.pendingFilters);
    //   this.pendingFilters = null;
    //   return;
    // }

    this.applyInitialFilters();
    // this.updateActiveFilters();
  }

  // async onCellClicked(event: any): Promise<void> {
  //   const columnField = event.colDef.field;
  //   const cellValue = event.value;

  //   if (!columnField || cellValue === undefined || cellValue === null) return;

  //   const colDef = this.gridApi.getColumnDef(columnField);
  //   const isDateColumn = colDef?.filter === 'agDateColumnFilter';

  //   let filterValue = cellValue;

  //   if (isDateColumn) {
  //     const parsedDate = parseDateFromAnyFormat(cellValue);
  //     if (parsedDate) {
  //       filterValue = parsedDate.getTime();
  //     } else {
  //       return;
  //     }
  //   }

  //   this.clickSubject.next({
  //     field: columnField,
  //     value: filterValue,
  //   });
  // }

  onCellDoubleClicked(event: any): void {
    this.clickSubject.next(null);
    console.log(event);

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

    // if (this.gridApi && this.isGridReady) {
    //   await this.applyFiltersReplacingAll(this.initialFilters);
    // } else {
    //   this.pendingFilters = [...this.initialFilters];
    // }

    this.updateActiveFilters();
  }

  // private async applyFiltersReplacingAll(
  //   filters: FilterTypeExp[],
  // ): Promise<void> {
  //   if (!filters || filters.length === 0) {
  //     this.clearAllFilters();
  //     return;
  //   }

  //   if (!this.gridApi) {
  //     this.pendingFilters = [...filters];
  //     return;
  //   }

  //   try {
  //     this.clearAllFilters();
  //     const availableColumns = this.gridApi.getColumnDefs() as ColDef[];
  //     const availableFields = new Set(
  //       availableColumns.map((col) => col.field).filter(Boolean),
  //     );

  //     const filterPromises = filters.map(async (filter) => {
  //       const camelCaseField = toCamelCase(filter.field);

  //       if (!availableFields.has(camelCaseField)) {
  //         return;
  //       }

  //       try {
  //         const filterInstance =
  //           await this.gridApi.getColumnFilterInstance(camelCaseField);
  //         if (!filterInstance?.setModel) return;

  //         const colDef = this.gridApi.getColumnDef(camelCaseField);
  //         const isDateColumn = colDef?.filter === 'agDateColumnFilter';

  //         if (isDateColumn) {
  //           await this.applyDateFilterWithGranularity(
  //             filterInstance,
  //             filter.value,
  //             filter.dateGranularity,
  //           );
  //         } else {
  //           filterInstance.setModel({
  //             type: 'equals',
  //             filter: filter.value,
  //           });
  //         }
  //       } catch (error) {
  //         console.error(
  //           `Ошибка при установке фильтра для ${camelCaseField}:`,
  //           error,
  //         );
  //       }
  //     });

  //     await Promise.all(filterPromises);
  //     this.gridApi.onFilterChanged();
  //     this.updateActiveFilters();
  //   } catch (error) {
  //     console.error('Error applying filters:', error);
  //     this.pendingFilters = [...filters];
  //   }
  // }

  // private async applyFiltersReplacingAll(
  //   filters: FilterTypeExp[],
  // ): Promise<void> {
  //   // if (!this.gridApi) {
  //   //   this.pendingFilters = [...filters];
  //   //   return;
  //   // }

  //   if (!filters || filters.length === 0) {
  //     this.clearAllFilters();
  //     return;
  //   }

  //   try {
  //     this.clearAllFilters();

  //     const availableColumns = this.gridApi.getColumnDefs() as ColDef[];
  //     const availableFields = new Set(
  //       availableColumns.map((col) => col.field).filter(Boolean),
  //     );

  //     for (const filter of filters) {
  //       const camelCaseField = toCamelCase(filter.field);

  //       if (!availableFields.has(camelCaseField)) {
  //         continue;
  //       }

  //       const colDef = this.gridApi.getColumnDef(camelCaseField);
  //       const isDateColumn = colDef?.filter === 'agDateColumnFilter';

  //       if (isDateColumn) {
  //         const model = this.buildDateFilterModel(
  //           filter.value,
  //           filter.dateGranularity,
  //         );

  //         if (model) {
  //           await this.gridApi.setColumnFilterModel(camelCaseField, model);
  //         }
  //       } else {
  //         await this.gridApi.setColumnFilterModel(camelCaseField, {
  //           filterType: 'text',
  //           type: 'equals',
  //           filter: filter.value,
  //         });
  //       }
  //     }

  //     this.gridApi.onFilterChanged();
  //     console.log('this.gridApi.onFilterChanged()', filters);
  //     this.updateActiveFilters();
  //   } catch (error) {
  //     console.error('Error applying filters:', error);
  //     // this.pendingFilters = [...filters];
  //   }
  // }

  // private async applyDateFilterWithGranularity(
  //   filterInstance: any,
  //   value: any,
  //   granularity?: DateGranularity,
  // ): Promise<void> {
  //   const date = parseDateFromAnyFormat(value);
  //   if (!date) return;

  //   let startDate: Date;
  //   let endDate: Date;

  //   switch (granularity) {
  //     case 'year':
  //       startDate = new Date(Date.UTC(date.getFullYear(), 0, 1, 0, 0, 0, 0));
  //       endDate = new Date(
  //         Date.UTC(date.getFullYear(), 11, 31, 23, 59, 59, 999),
  //       );
  //       break;

  //     case 'month':
  //       startDate = new Date(
  //         Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0),
  //       );
  //       endDate = new Date(
  //         Date.UTC(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0),
  //       );
  //       break;

  //     case 'day':
  //     default:
  //       startDate = new Date(
  //         Date.UTC(
  //           date.getFullYear(),
  //           date.getMonth(),
  //           date.getDate(),
  //           0,
  //           0,
  //           0,
  //           0,
  //         ),
  //       );
  //       endDate = new Date(
  //         Date.UTC(
  //           date.getFullYear(),
  //           date.getMonth(),
  //           date.getDate() + 1,
  //           0,
  //           0,
  //           0,
  //           0,
  //         ),
  //       );
  //       break;
  //   }
  //   filterInstance.setModel({
  //     type: 'inRange',
  //     dateFrom: startDate.toISOString(),
  //     dateTo: endDate.toISOString(),
  //   });
  // }

  // private buildDateFilterModel(
  //   value: any,
  //   granularity?: DateGranularity,
  // ): any | null {
  //   const date = parseDateFromAnyFormat(value);
  //   if (!date) return null;

  //   let startDate: Date;
  //   let endDate: Date;

  //   switch (granularity) {
  //     case 'year':
  //       startDate = new Date(Date.UTC(date.getFullYear(), 0, 1, 0, 0, 0, 0));
  //       endDate = new Date(
  //         Date.UTC(date.getFullYear(), 11, 31, 23, 59, 59, 999),
  //       );
  //       break;

  //     case 'month':
  //       startDate = new Date(
  //         Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0),
  //       );
  //       endDate = new Date(
  //         Date.UTC(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0),
  //       );
  //       break;

  //     case 'day':
  //     default:
  //       startDate = new Date(
  //         Date.UTC(
  //           date.getFullYear(),
  //           date.getMonth(),
  //           date.getDate(),
  //           0,
  //           0,
  //           0,
  //           0,
  //         ),
  //       );
  //       endDate = new Date(
  //         Date.UTC(
  //           date.getFullYear(),
  //           date.getMonth(),
  //           date.getDate() + 1,
  //           0,
  //           0,
  //           0,
  //           0,
  //         ),
  //       );
  //       break;
  //   }

  //   return {
  //     filterType: 'date',
  //     type: 'inRange',
  //     dateFrom: startDate.toISOString(),
  //     dateTo: endDate.toISOString(),
  //   };
  // }

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

  // private async applyFilterAppending(field: string, value: any): Promise<void> {
  //   // if (!this.gridApi) {
  //   //   this.pendingFilters = [{ field, value }];
  //   //   return;
  //   // }

  //   try {
  //     const filterInstance = await this.gridApi.getColumnFilterInstance(field);
  //     if (filterInstance?.setModel) {
  //       const colDef = this.gridApi.getColumnDef(field);
  //       const isDateColumn = colDef?.filter === 'agDateColumnFilter';

  //       if (isDateColumn) {
  //         const date = parseDateFromAnyFormat(value);
  //         if (!date) return;

  //         const utcDate = new Date(
  //           Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  //         );

  //         filterInstance.setModel({
  //           type: 'equals',
  //           dateFrom: utcDate.toISOString(),
  //           dateTo: new Date(utcDate.getTime() + 86400000 - 1).toISOString(),
  //         });
  //       } else {
  //         filterInstance.setModel({
  //           type: 'equals',
  //           filter: value,
  //         });
  //       }

  //       this.gridApi.onFilterChanged();
  //       // this.updateActiveFilters();
  //     }
  //   } catch (error) {
  //     console.error('Error applying filter (appending):', error);
  //     // this.pendingFilters = [{ field, value }];
  //   }
  // }

  // private async applyFilterAppending(field: string, value: any): Promise<void> {
  //   if (!this.gridApi) {
  //     this.pendingFilters = [{ field, value }];
  //     return;
  //   }

  //   try {
  //     const colDef = this.gridApi.getColumnDef(field);
  //     const isDateColumn = colDef?.filter === 'agDateColumnFilter';

  //     if (isDateColumn) {
  //       const date = parseDateFromAnyFormat(value);
  //       if (!date) return;

  //       const utcDate = new Date(
  //         Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  //       );

  //       await this.gridApi.setColumnFilterModel(field, {
  //         filterType: 'date',
  //         type: 'equals',
  //         dateFrom: utcDate.toISOString(),
  //       });
  //     } else {
  //       await this.gridApi.setColumnFilterModel(field, {
  //         filterType: 'text',
  //         type: 'equals',
  //         filter: value,
  //       });
  //     }

  //     this.gridApi.onFilterChanged();
  //   } catch (error) {
  //     console.error('Error applying filter (appending):', error);
  //     this.pendingFilters = [{ field, value }];
  //   }
  // }

  // async removeFilter(colId: string): Promise<void> {
  //   if (!this.gridApi) return;

  //   await this.gridApi.setColumnFilterModel(colId, null);
  //   this.gridApi.onFilterChanged();

  //   this.updateActiveFilters();
  // }

  async removeFilter(colId: string): Promise<void> {
    if (!this.gridApi) return;

    // await this.gridApi.setColumnFilterModel(colId, null);
    // this.gridApi.onFilterChanged();

    // this.activeFilters = this.activeFilters.filter((f) => f.colId !== colId);

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

  // private updateActiveFiltersFromInput(filters: FilterTypeExp[]): void {
  //   this.activeFilters = filters.map((filter) => ({
  //     colId: filter.field,
  //     value: this.formatFilterValue(filter),
  //     dateGranularity: filter.dateGranularity,
  //   }));
  //   console.log('this.activeFilters 3', this.activeFilters);
  // }

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
