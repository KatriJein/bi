import { ColumnTable, from, op } from 'arquero';
import { DateGranularity } from '../core/api/graphql/types';
import { safeParseDate } from './charts';

export function isDateComparisonOperator(operator: string): boolean {
  const dateComparisonOperators = [
    'Равно',
    'Не равно',
    'Больше',
    'Меньше',
    'Больше или равно',
    'Меньше или равно',
    'Принадлежит диапазону',
  ];
  return dateComparisonOperators.includes(operator);
}

export function applyDateRangeFilterWithGranularity(
  aqTable: ColumnTable,
  column: string,
  value: [any, any],
  granularity: DateGranularity
): ColumnTable {
  const [startValue, endValue] = value;
  const startDate = safeParseDate(startValue);
  const endDate = safeParseDate(endValue);

  // console.log('startDate', startDate, 'endDate', endDate);

  if (!startDate || !endDate) {
    console.warn(`Invalid date range values for field ${column}:`, value);
    return aqTable;
  }

  const data = aqTable.objects();

  const filteredData = data.filter((item: any) => {
    const dataDate = safeParseDate(item[column]);
    if (!dataDate) return false;

    return (
      compareDatesByGranularity(
        dataDate,
        startDate,
        granularity,
        'Больше или равно'
      ) &&
      compareDatesByGranularity(
        dataDate,
        endDate,
        granularity,
        'Меньше или равно'
      )
    );
  });

  return from(filteredData);
}

export function compareDatesByGranularity(
  date1: Date | string,
  date2: Date | string,
  granularity: DateGranularity,
  operator: string = 'Равно'
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }

  switch (granularity) {
    case 'year':
      return compareYears(d1, d2, operator);
    case 'month':
      return compareMonths(d1, d2, operator);
    case 'day':
    default:
      return compareDays(d1, d2, operator);
  }
}

function compareYears(date1: Date, date2: Date, operator: string): boolean {
  const year1 = date1.getFullYear();
  const year2 = date2.getFullYear();

  return compareValues(year1, year2, operator);
}

function compareMonths(date1: Date, date2: Date, operator: string): boolean {
  const month1 = date1.getMonth();
  const month2 = date2.getMonth();
  const year1 = date1.getFullYear();
  const year2 = date2.getFullYear();

  const value1 = year1 * 12 + month1;
  const value2 = year2 * 12 + month2;

  return compareValues(value1, value2, operator);
}

function compareDays(date1: Date, date2: Date, operator: string): boolean {
  const time1 = date1.getTime();
  const time2 = date2.getTime();

  return compareValues(time1, time2, operator);
}

function compareValues(
  value1: number,
  value2: number,
  operator: string
): boolean {
  switch (operator) {
    case 'Равно':
      return value1 === value2;
    case 'Не равно':
      return value1 !== value2;
    case 'Больше':
      return value1 > value2;
    case 'Меньше':
      return value1 < value2;
    case 'Больше или равно':
      return value1 >= value2;
    case 'Меньше или равно':
      return value1 <= value2;
    default:
      return value1 === value2;
  }
}
