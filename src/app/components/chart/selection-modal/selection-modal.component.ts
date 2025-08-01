import { Component, inject, Inject, OnInit } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Column } from '../../../core/models';
import {
  getSelectionOptionsByType,
  SelectionColumnType,
} from '../../../constants';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TsType } from '../../../core/utils';
import { ChartFilter } from '../../../core/api/graphql/types';

interface FormValue {
  name: string;
  column: Column;
  filterType: string;
}

@Component({
  standalone: true,
  selector: 'chart-selection-modal',
  imports: [
    MatInputModule,
    MatSelectModule,
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './selection-modal.component.html',
  styleUrl: './selection-modal.component.scss',
})
export class ChartSelectionModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ChartSelectionModalComponent>);
  private data = inject<{
    columns$: Observable<Column[]>;
    selection: ChartFilter;
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form: FormGroup;
  filterOptions: string[] = [];

  get isEditMode(): boolean {
    return !!this.data.selection;
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.selection) {
      this.initFormWithSelection(this.data.selection);
    }

    this.form.get('column')?.valueChanges.subscribe((column: Column) => {
      this.updateFilterOptions(column);
    });
  }

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      column: [null, Validators.required],
      filterType: [{ value: '', disabled: true }, Validators.required],
    });
  }

  get columns$(): Observable<Column[]> {
    return this.data.columns$;
  }

  private updateFilterOptions(column: Column): void {
    if (column) {
      this.filterOptions = getSelectionOptionsByType(
        column.dataType as SelectionColumnType
      );
      const filterTypeControl = this.form.get('filterType');
      filterTypeControl?.enable();
      filterTypeControl?.reset();
    } else {
      this.form.get('filterType')?.disable();
      this.filterOptions = [];
    }
  }

  private initFormWithSelection(selection: ChartFilter): void {
    this.columns$.pipe(take(1)).subscribe((columns) => {
      const matchingColumn = columns.find(
        (c) => c.columnName === selection.fieldName
      );
      if (matchingColumn) {
        this.updateFilterOptions(matchingColumn);

        this.form.patchValue({
          name: selection.name,
          column: matchingColumn,
          filterType: selection.filterType,
        });
      }
    });
  }

  onSave(): void {
    if (this.form.valid) {
      const { column, filterType, name } = this.form.value as FormValue;
      this.dialogRef.close({
        name,
        columnName: column.columnName,
        columnType: column.dataType,
        filterType: filterType,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
