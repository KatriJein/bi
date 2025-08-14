import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  getNameOfType,
  getSelectionOptionsByType,
  SelectionColumnType,
} from '../../../constants';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { SelectionTypeDashboard } from '../../../core/store/charts';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DashboardFilter } from '../../../core/api/graphql/types';
import { parseDateFromAnyFormat } from '../../../utils';
import { DateInputComponent } from '../../common';

const DATE_RANGE_FILTER = 'Принадлежит диапазону';

@Component({
  selector: 'dashboard-selection-modal',
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    DateInputComponent,
  ],
  templateUrl: './selection-modal.component.html',
  styleUrl: './selection-modal.component.scss',
})
export class DashboardSelectionModalComponent implements OnInit {
  readonly DATE_RANGE_FILTER = DATE_RANGE_FILTER;

  private fb = inject(FormBuilder);
  private data = inject<{ filter?: DashboardFilter }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DashboardSelectionModalComponent>);

  filterForm: FormGroup;
  columnTypes: SelectionColumnType[] = ['string', 'number', 'date'];
  currentInputType: string = 'text';
  filterTypes: string[] = [];
  showSecondDateInput = false;

  filterValueDateRange: [string | null, string | null] = [null, null];
  dateRange: [Date | null, Date | null] = [null, null];

  getNameOfType = getNameOfType;
  getSelectionOptionsByType = getSelectionOptionsByType;

  get isEditMode(): boolean {
    return !!this.data.filter;
  }

  constructor() {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      filterType: ['', Validators.required],
      value: [''],
    });
  }

  onDateRangeChange(index: number, value: string | null): void {
    this.filterValueDateRange[index] = value;
    this.dateRange[index] = value
      ? parseDateFromAnyFormat(value, 'yyyy-MM-dd')
      : null;
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.initFormWithExistingFilter(this.data.filter!);
    }

    this.filterForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateValueInputType(type);
      this.updateFilterTypes(type);
    });

    this.filterForm.get('filterType')?.valueChanges.subscribe((filterType) => {
      this.showSecondDateInput =
        filterType === DATE_RANGE_FILTER &&
        this.filterForm.get('type')?.value === 'date';
      this.updateValidators();
    });
  }

  private updateFilterTypes(type: SelectionColumnType): void {
    this.filterTypes = this.getSelectionOptionsByType(type);
    this.filterForm.get('filterType')?.setValue('');
  }

  private updateValueInputType(type: SelectionColumnType): void {
    if (type === 'date') {
      this.currentInputType = 'date';
      this.filterForm.get('value')?.disable();
      this.filterForm.get('dateValue')?.enable();
    } else {
      this.currentInputType = type === 'number' ? 'number' : 'text';
      this.filterForm.get('value')?.enable();
      this.filterForm.get('dateValue')?.disable();
      this.filterForm.get('secondDateValue')?.disable();
      this.showSecondDateInput = false;
    }
  }

  private updateValidators(): void {
    const dateValueControl = this.filterForm.get('dateValue');
    const secondDateValueControl = this.filterForm.get('secondDateValue');

    if (this.showSecondDateInput) {
      dateValueControl?.setValidators([Validators.required]);
      secondDateValueControl?.setValidators([Validators.required]);
    } else {
      dateValueControl?.setValidators([Validators.required]);
      secondDateValueControl?.clearValidators();
    }

    dateValueControl?.updateValueAndValidity();
    secondDateValueControl?.updateValueAndValidity();
  }

  private initFormWithExistingFilter(filter: DashboardFilter): void {
    this.filterTypes = this.getSelectionOptionsByType(
      filter.fieldType as SelectionColumnType
    );

    this.filterForm.patchValue({
      name: filter.name,
      type: filter.fieldType,
      filterType: filter.filterType,
    });

    if (filter.fieldType === 'date') {
      if (
        filter.filterType === DATE_RANGE_FILTER &&
        Array.isArray(filter.value.value)
      ) {
        const [startDate, endDate] = filter.value.value;
        this.filterValueDateRange = [startDate, endDate];
        this.dateRange = [
          parseDateFromAnyFormat(startDate, 'yyyy-MM-dd'),
          parseDateFromAnyFormat(endDate, 'yyyy-MM-dd'),
        ];
        this.showSecondDateInput = true;
      } else {
        this.filterValueDateRange = [filter.value.value as string, null];
        this.dateRange[0] = parseDateFromAnyFormat(
          filter.value.value as string,
          'yyyy-MM-dd'
        );
      }
    } else {
      this.filterForm.patchValue({
        value: filter.value.value,
      });
    }

    this.updateValueInputType(filter.fieldType as SelectionColumnType);
  }

  onSave(): void {
    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;
      let value: string | string[];

      if (formValue.type === 'date') {
        if (formValue.filterType === DATE_RANGE_FILTER) {
          value = [
            this.filterValueDateRange[0] || '',
            this.filterValueDateRange[1] || '',
          ];
        } else {
          value = this.filterValueDateRange[0] || '';
        }
      } else {
        value = formValue.value;
      }

      const newFilter: SelectionTypeDashboard = {
        name: formValue.name,
        columnType: formValue.type,
        filterType: formValue.filterType,
        value,
      };

      this.dialogRef.close(newFilter);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getValuePlaceholder(): string {
    switch (this.currentInputType) {
      case 'number':
        return 'Введите число';
      case 'date':
        return 'Выберите дату';
      default:
        return 'Введите значение';
    }
  }
}
