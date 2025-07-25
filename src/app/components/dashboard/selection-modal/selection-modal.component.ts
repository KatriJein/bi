import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
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
import { SelectionColumnType } from '../../../constants';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { SelectionType } from '../../../core/store/charts';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
export class AddSelectionModalComponent implements OnInit {
  filterForm: FormGroup;
  filterTypes: SelectionColumnType[] = ['string', 'number', 'date'];
  currentInputType: string = 'text';

  ngOnInit(): void {
    this.updateValueInputType(this.filterForm.get('type')?.value);

    this.filterForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateValueInputType(type);
      this.cdr.detectChanges();
    });
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { availableColumns: string[] },
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      value: ['', Validators.required],
      dateValue: [null],
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

      const newFilter: SelectionType = {
        columnName: formValue.name,
        columnType: formValue.type,
        filterType: value,
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
