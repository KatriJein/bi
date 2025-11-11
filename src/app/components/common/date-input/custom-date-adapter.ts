import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { DateGranularity } from '../../../core/api/graphql/types';

@Injectable()
export class GranularDateAdapter extends NativeDateAdapter {
  public granularity: DateGranularity  = 'day';

   constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
    super(matDateLocale);
  }

  override format(date: Date, displayFormat: Object): string {
    if (!date) return '';

    switch (this.granularity) {
      case 'month':
        return date.toLocaleString('ru-RU', { month: 'short', year: 'numeric' });
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString('ru-RU');
    }
  }
}
