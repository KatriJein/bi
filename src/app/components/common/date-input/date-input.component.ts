import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { formatDate } from '../../../utils';
import { DateGranularity } from '../../../core/api/graphql/types';
import { GranularDateAdapter } from './custom-date-adapter';

export const MY_DATE_FORMATS = {
  parse: { dateInput: null },
  display: {
    dateInput: null,
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
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
      useClass: GranularDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class DateInputComponent implements OnChanges {
  @Input() label: string = '';
  @Input() dateValue: string | null = null;
  @Input() granularity: DateGranularity = 'day';
  @Output() dateValueChange = new EventEmitter<string | null>();
  @ViewChild('datePicker') datePicker!: MatDatepicker<Date>;

  placeholder: string = '';

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['granularity'] && this.dateValue) {
      (this.dateAdapter as any).granularity = this.granularity;
      this.updatePlaceholder();

      const parsed = new Date(this.dateValue);
      const adjusted = this.adjustDateByGranularity(parsed, this.granularity);

      Promise.resolve().then(() => {
        this.dateValueChange.emit(formatDate(adjusted, 'yyyy-MM-dd'));
        if (this.datePicker) {
          this.datePicker.select(adjusted);
        }
        this.cdr.detectChanges();
      });
    }
  }

  private adjustDateByGranularity(
    date: Date,
    granularity: DateGranularity,
  ): Date {
    switch (granularity) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case 'year':
        return new Date(date.getFullYear(), 0, 1); 
      default:
        return date;
    }
  }

  private updatePlaceholder(): void {
    switch (this.granularity) {
      case 'month':
        this.placeholder = 'МММ ГГГГ';
        break;
      case 'year':
        this.placeholder = 'ГГГГ';
        break;
      default:
        this.placeholder = 'ДД.ММ.ГГГГ';
    }
  }

  onDatePickerChange(event: MatDatepickerInputEvent<Date>): void {
    const value = event.value ? formatDate(event.value, 'yyyy-MM-dd') : null;
    this.dateValueChange.emit(value);
  }

  /** Обработка выбора месяца */
  monthSelected(date: Date, datepicker: MatDatepicker<Date>) {
    const result = new Date(date.getFullYear(), date.getMonth(), 1);
    this.emitAndClose(result, datepicker);
  }

  /** Обработка выбора года */
  yearSelected(date: Date, datepicker: MatDatepicker<Date>) {
    const result = new Date(date.getFullYear(), 0, 1);
    this.emitAndClose(result, datepicker);
  }

  /** Универсальный метод для закрытия и вывода */
  private emitAndClose(date: Date, datepicker: MatDatepicker<Date>) {
    const formatted = this.formatByGranularity(date);
    this.dateValueChange.emit(formatted.value);
    datepicker.close();
  }

  /** Форматирование по granularity */
  private formatByGranularity(date: Date): { value: string; display: string } {
    switch (this.granularity) {
      case 'month':
        return {
          value: formatDate(date, 'yyyy-MM-dd'),
          display: formatDate(date, 'MMM yyyy'),
        };
      case 'year':
        return {
          value: formatDate(date, 'yyyy-MM-dd'),
          display: formatDate(date, 'yyyy'),
        };
      default:
        return {
          value: formatDate(date, 'yyyy-MM-dd'),
          display: formatDate(date, 'dd.MM.yyyy'),
        };
    }
  }
}
