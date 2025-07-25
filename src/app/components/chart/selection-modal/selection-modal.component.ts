import { Component, inject, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Column } from '../../../core/models';
import { getSelectionOptionsByType } from '../../../constants';
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

interface FormValue {
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
export class ChartSelectionModalComponent {
  form: FormGroup;
  filterOptions: string[] = [];

  private dialogRef = inject(MatDialogRef<ChartSelectionModalComponent>);
  private data = inject<{ columns$: Observable<Column[]> }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      column: [null, Validators.required],
      filterType: [{ value: null, disabled: true }, Validators.required],
    });

    this.form.get('column')?.valueChanges.subscribe((column: Column) => {
      this.updateFilterOptions(column);
    });
  }

  get columns$(): Observable<Column[]> {
    return this.data.columns$;
  }

  private updateFilterOptions(column: Column): void {
    if (column) {
      this.filterOptions = getSelectionOptionsByType(
        column.dataType,
        column.aggregate
      );
      const filterTypeControl = this.form.get('filterType');
      filterTypeControl?.enable();
      filterTypeControl?.reset();
    } else {
      this.form.get('filterType')?.disable();
      this.filterOptions = [];
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const { column, filterType } = this.form.value as FormValue;
      this.dialogRef.close({
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
