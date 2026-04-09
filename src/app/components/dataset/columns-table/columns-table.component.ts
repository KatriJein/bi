import { Component, OnDestroy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Column, Dataset } from '../../../core/models';
import { Observable, Subscription } from 'rxjs';
import {
  aggregateLabelMap,
  aggregateOptionsByType,
  fieldTypes,
} from '../../../utils/columns-table.utils';
import { DatasetStateService } from '../../../services';
import { Table } from '../../../core/api/graphql/types';

@Component({
  selector: 'app-columns-table',
  templateUrl: './columns-table.component.html',
  styleUrls: ['./columns-table.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    CommonModule,
    MatIconModule,
  ],
})
export class ColumnsTableComponent implements OnDestroy {
  dataset$: Observable<Dataset>;
  selectedTables$: Observable<Table[]>;

  fieldTypes = fieldTypes;
  aggregateOptions = aggregateOptionsByType;
  aggregateLabels = aggregateLabelMap;
  displayedColumns: string[] = [
    'alias',
    'columnName',
    'dataType',
    'isVisible',
    'aggregate',
  ];
  editableColumnIndex: number | null = null;
  editableField: string | null = null;
  private datasetSubscription: Subscription | null = null;

  constructor( private datasetState: DatasetStateService) {
    this.dataset$ = this.datasetState.dataset$;
    this.selectedTables$ = this.datasetState.selectedTables$;
  }

  ngOnDestroy() {
    if (this.datasetSubscription) {
      this.datasetSubscription.unsubscribe();
    }
  }

  startEditing(index: number, field: string) {
    this.editableColumnIndex = index;
    this.editableField = field;
  }

  stopEditing() {
    this.editableColumnIndex = null;
    this.editableField = null;
  }

  isEditing(index: number, field: string) {
    return this.editableColumnIndex === index && this.editableField === field;
  }

  updateValue<K extends keyof Column>(
    index: number,
    field: K,
    value: Column[K]
  ) {
    this.datasetState.updateColumn(index, field, value);
    this.stopEditing();
  }

  onBlur(event: FocusEvent, index: number, field: keyof Column) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.updateValue(index, field, target.value);
    }
  }

  onEnter(event: Event, index: number, field: keyof Column) {
    const keyboardEvent = event as KeyboardEvent;
    const target = keyboardEvent.target as HTMLInputElement;
    if (target) {
      this.updateValue(index, field, target.value);
    }
  }
}
