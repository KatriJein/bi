import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
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
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DashboardFilter } from '../../../core/api/graphql/types';

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
  ],
  templateUrl: './selection-modal.component.html',
  styleUrl: './selection-modal.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD.MM.YYYY',
        },
        display: {
          dateInput: 'DD.MM.YYYY',
          monthYearLabel: 'MMMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
    {
      provide: DateAdapter,
      useClass: NativeDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
  ],
})
export class DashboardSelectionModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private data = inject<{ filter?: DashboardFilter }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DashboardSelectionModalComponent>);
  
  filterForm: FormGroup;
  columnTypes: SelectionColumnType[] = ['string', 'number', 'date'];
  currentInputType: string = 'text';
  filterTypes: string[] = [];

  getNameOfType = getNameOfType;
  getSelectionOptionsByType = getSelectionOptionsByType;

  get isEditMode(): boolean {
    return !!this.data.filter;
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.initFormWithExistingFilter(this.data.filter!);
    } else {
      this.updateValueInputType(this.filterForm.get('type')?.value);
    }

    this.filterForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateValueInputType(type);
      this.filterTypes = getSelectionOptionsByType(type);
      this.filterForm.get('filterType')?.setValue('');
      this.cdr.detectChanges();
    });
  }

  constructor() {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      filterType: ['', Validators.required],
      value: ['', Validators.required],
      dateValue: [null],
      secondValue: [''],
    });
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
    }
  }

  private initFormWithExistingFilter(filter: DashboardFilter): void {
    this.filterForm.patchValue({
      name: filter.name,
      type: filter.fieldType,
      filterType: filter.filterType,
    });

    if (filter.fieldType === 'date') {
      const [day, month, year] = filter.value.value.split('.');
      const date = new Date(+year, +month - 1, +day);
      this.filterForm.patchValue({
        dateValue: date,
      });
    } else {
      this.filterForm.patchValue({
        value: filter.value.value,
      });
    }

    this.updateValueInputType(filter.fieldType as SelectionColumnType);
    this.filterTypes = getSelectionOptionsByType(
      filter.fieldType as SelectionColumnType
    );
  }

  onSave(): void {
    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;
      let value: any;

      if (formValue.type === 'date') {
        const date = new Date(formValue.dateValue);
        date.setHours(0, 0, 0, 0);
        value = this.formatDate(date);
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

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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
