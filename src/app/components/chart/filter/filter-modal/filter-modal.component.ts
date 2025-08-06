import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import {
  MatDatepickerModule,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';

import { Column } from '../../../../core/models';
import { getFilterOptionsByType } from '../../../../constants';
import { ChartService } from '../../../../core/api/services';
import { toCamelCase } from '../../../../core/utils';
import { FilterColumn } from '../../../../services/chart-state.service';
import { formatDate, parseDateFromAnyFormat } from '../../../../utils';

export interface AddFilterModalData {
  columns: Column[];
  filterToEdit?: FilterColumn;
}

@Component({
  selector: 'chart-filter-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss',
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['DD.MM.YYYY', 'YYYY-MM-DD'],
        },
        display: {
          dateInput: 'DD.MM.YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
export class FilterModalComponent implements OnInit {
  private chartService = inject(ChartService);
  private dateAdapter = inject(DateAdapter);

  selectedColumn: Column | null = null;
  selectedFilterType: string | null = null;
  filterValueSingle: string | null = null;
  filterValueMulti: string[] = [];
  filterValueDateRange: [string | null, string | null] = [null, null];
  dateRange: [Date | null, Date | null] = [null, null];

  filterTypes: string[] = [];
  availableValues: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddFilterModalData,
    private dialogRef: MatDialogRef<FilterModalComponent>
  ) {
    this.dateAdapter.setLocale('ru');
  }

  ngOnInit(): void {
    this.initializeEditMode();
  }

  ngOnChanges(): void {
    this.onColumnChange();
  }

  private initializeEditMode(): void {
    if (!this.data.filterToEdit) return;

    const filter = this.data.filterToEdit;
    this.selectedColumn =
      this.data.columns.find(
        (col) =>
          col.columnName === filter.columnName &&
          col.tableName === filter.tableName
      ) ?? null;

    if (!this.selectedColumn) return;

    this.initializeFilterSettings();
    this.initializeFilterValues(filter);
    this.onFilterTypeChange();
  }

  private initializeFilterSettings(): void {
    const { dataType, aggregate } = this.selectedColumn!;
    this.filterTypes = getFilterOptionsByType(dataType, aggregate);
    this.selectedFilterType = this.data.filterToEdit?.filterType || null;
  }

  private initializeFilterValues(filter: FilterColumn): void {
    if (Array.isArray(filter.value)) {
      if (this.selectedFilterType === 'Принадлежит диапазону') {
        this.initializeDateRangeFilter(filter.value as [string, string]);
      } else {
        this.filterValueMulti = [...filter.value];
      }
    } else {
      this.initializeSingleValueFilter(
        filter.value,
        this.selectedColumn!.dataType
      );
    }
  }

  private initializeDateRangeFilter(values: [string, string]): void {
    this.filterValueDateRange = [...values];
    this.dateRange = [
      values[0] ? parseDateFromAnyFormat(values[0]) : null,
      values[1] ? parseDateFromAnyFormat(values[1]) : null,
    ];
  }

  private initializeSingleValueFilter(value: string, dataType: string): void {
    if (dataType === 'date' && value) {
      const parsedDate = parseDateFromAnyFormat(value);
      this.filterValueSingle = parsedDate
        ? formatDate(parsedDate, 'yyyy-MM-dd')
        : value;
    } else {
      this.filterValueSingle = value;
    }
  }

  onAdd(): void {
    this.dialogRef.close({
      ...this.selectedColumn,
      filterType: this.selectedFilterType,
      value: this.prepareFilterValue(),
    });
  }

  onColumnChange(): void {
    if (!this.selectedColumn) return;

    const { dataType, aggregate } = this.selectedColumn;
    this.filterTypes = getFilterOptionsByType(dataType, aggregate);
    this.selectedFilterType = null;
    this.filterValueSingle = null;
    this.filterValueMulti = [];
    this.availableValues = [];
  }

  onFilterTypeChange(): void {
    if (this.isMultiSelectFilter() && this.selectedColumn) {
      this.loadAvailableValues();
    }
  }

  onDateInputChange(index: number, event: any): void {
    const inputValue = event.target.value;
    const parsedDate = parseDateFromAnyFormat(inputValue, 'DD.MM.YYYY');

    if (parsedDate) {
      this.dateRange[index] = parsedDate;
      this.filterValueDateRange[index] = formatDate(parsedDate, 'yyyy-MM-dd');
    } else {
      this.filterValueDateRange[index] = inputValue;
      this.dateRange[index] = null;
    }
  }

  onDatePickerChange(
    index: number,
    event: MatDatepickerInputEvent<Date>
  ): void {
    if (event.value) {
      this.dateRange[index] = event.value;
      this.filterValueDateRange[index] = formatDate(event.value, 'yyyy-MM-dd');
    } else {
      this.dateRange[index] = null;
      this.filterValueDateRange[index] = null;
    }
  }

  onSingleDatePickerChange(event: MatDatepickerInputEvent<Date>): void {
    this.filterValueSingle = event.value
      ? formatDate(event.value, 'yyyy-MM-dd')
      : null;
  }

  onSingleDateInputChange(event: any): void {
    const inputValue = event.target.value;
    const parsedDate = parseDateFromAnyFormat(inputValue, 'DD.MM.YYYY');
    this.filterValueSingle = parsedDate
      ? formatDate(parsedDate, 'yyyy-MM-dd')
      : inputValue;
  }

  private prepareFilterValue(): any {
    if (this.isMultiSelectFilter()) {
      return this.filterValueMulti;
    }

    if (this.selectedFilterType === 'Принадлежит диапазону') {
      return [
        this.dateRange[0]
          ? formatDate(this.dateRange[0], 'yyyy-MM-dd')
          : this.filterValueDateRange[0],
        this.dateRange[1]
          ? formatDate(this.dateRange[1], 'yyyy-MM-dd')
          : this.filterValueDateRange[1],
      ];
    }

    if (this.isDateColumn() && this.filterValueSingle) {
      const parsedDate = parseDateFromAnyFormat(
        this.filterValueSingle,
        'DD.MM.YYYY'
      );
      return parsedDate
        ? formatDate(parsedDate, 'yyyy-MM-dd')
        : this.filterValueSingle;
    }

    return this.filterValueSingle;
  }

  private loadAvailableValues(): void {
    this.chartService
      .getData(toCamelCase(this.selectedColumn!.tableName), [
        toCamelCase(this.selectedColumn!.columnName),
      ])
      .subscribe((data) => {
        const colName = toCamelCase(this.selectedColumn!.columnName);
        const values = data.map((row) => row[colName]);
        this.availableValues = Array.from(new Set(values)).filter(
          (v) => v !== null && v !== undefined
        );
      });
  }

  isDateColumn(): boolean {
    return this.selectedColumn?.dataType === 'date';
  }

  isMultiSelectFilter(): boolean {
    return ['Принадлежит множеству', 'Не принадлежит множеству'].includes(
      this.selectedFilterType || ''
    );
  }

  isEmptyFilter(): boolean {
    return ['Пусто', 'Не пусто'].includes(this.selectedFilterType || '');
  }

  addToSelected(value: string): void {
    if (!this.filterValueMulti.includes(value)) {
      this.filterValueMulti.push(value);
    }
  }

  removeFromSelected(value: string): void {
    this.filterValueMulti = this.filterValueMulti.filter((v) => v !== value);
  }
}
