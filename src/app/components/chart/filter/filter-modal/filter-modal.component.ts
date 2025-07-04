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

import { Column } from '../../../../core/models';
import { getFilterOptionsByType } from '../../../../constants';
import { ChartService } from '../../../../core/api/services';
import { toCamelCase } from '../../../../core/utils';
import { FilterColumn } from '../../../../services/chart-state.service';

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
  ],
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss',
})
export class FilterModalComponent implements OnInit {
  private chartService = inject(ChartService);

  selectedColumn: Column | null = null;
  selectedFilterType: string | null = null;
  filterValueSingle: string | null = null;
  filterValueMulti: string[] = [];
  filterValueDateRange: [string | null, string | null] = [null, null];

  filterTypes: string[] = [];
  availableValues: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddFilterModalData,
    private dialogRef: MatDialogRef<FilterModalComponent>
  ) {}

  ngOnInit() {
    if (this.data.filterToEdit) {
      const filter = this.data.filterToEdit;
      this.selectedColumn =
        this.data.columns.find(
          (col) =>
            col.columnName === filter.columnName &&
            col.tableName === filter.tableName
        ) ?? null;

      if (!this.selectedColumn) return;
      const { dataType, aggregate } = this.selectedColumn;
      this.filterTypes = getFilterOptionsByType(dataType, aggregate);
      this.selectedFilterType = filter.filterType;

      if (Array.isArray(filter.value)) {
        this.filterValueMulti = [...filter.value];
      } else {
        this.filterValueSingle = filter.value;
      }

      this.onFilterTypeChange();
    }
  }

  ngOnChanges() {
    this.onColumnChange();
  }

  onAdd(): void {
    let value: any;

    if (this.isMultiSelectFilter()) {
      value = this.filterValueMulti;
    } else if (this.selectedFilterType === 'Принадлежит диапазону') {
      value = [...this.filterValueDateRange];
    } else {
      value = this.filterValueSingle;
    }

    this.dialogRef.close({
      ...this.selectedColumn,
      filterType: this.selectedFilterType,
      value,
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

  isMultiSelectFilter(): boolean {
    return (
      this.selectedFilterType === 'Принадлежит множеству' ||
      this.selectedFilterType === 'Не принадлежит множеству'
    );
  }

  isEmptyFilter(): boolean {
    return (
      this.selectedFilterType === 'Пусто' ||
      this.selectedFilterType === 'Не пусто'
    );
  }

  onFilterTypeChange(): void {
    if (this.isMultiSelectFilter() && this.selectedColumn) {
      this.chartService
        .getData(toCamelCase(this.selectedColumn.tableName), [
          toCamelCase(this.selectedColumn.columnName),
        ])
        .subscribe((data) => {
          const colName = toCamelCase(this.selectedColumn!.columnName);
          const values = data.map((row) => row[colName]);
          this.availableValues = Array.from(new Set(values)).filter(
            (v) => v !== null && v !== undefined
          );
        });
    }
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
