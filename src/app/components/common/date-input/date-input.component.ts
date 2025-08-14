import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
} from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { formatDate, parseDateFromAnyFormat } from '../../../utils';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: ['DD.MM.YYYY', 'YYYY-MM-DD'],
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
  ],
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: NativeDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class DateInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = 'ДД.ММ.ГГГГ или выберите из календаря';
  @Input() dateValue: string | null = null;
  @Output() dateValueChange = new EventEmitter<string | null>();

  onDatePickerChange(event: MatDatepickerInputEvent<Date>): void {
    const value = event.value
      ? formatDate(event.value, 'yyyy-MM-dd')
      : null;
    this.dateValueChange.emit(value);
  }

  onDateInputChange(event: any): void {
    const inputValue = event.target.value;
    const parsedDate = parseDateFromAnyFormat(inputValue, 'DD.MM.YYYY');
    const value = parsedDate
      ? formatDate(parsedDate, 'yyyy-MM-dd')
      : inputValue;
    this.dateValueChange.emit(value);
  }
}
