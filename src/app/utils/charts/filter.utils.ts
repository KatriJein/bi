import moment from 'moment';
import { from, escape, ColumnTable } from 'arquero';
import { toCamelCase } from '../../core/utils';
import { FilterType } from '../../core/store/charts';

export function applyFilters(
  data: Record<string, any>[],
  filters: FilterType[]
): ColumnTable {
  let aqTable = from(data);

  for (const filter of filters) {
    const col = toCamelCase(filter.columnName);
    const type = filter.filterType;
    const val = filter.value;

    if (!col || !type || val === undefined || val === null) continue;

    switch (type) {
      case 'Равно':
        aqTable = aqTable.filter(escape((d: any) => d[col] === val));
        break;
      case 'Не равно':
        aqTable = aqTable.filter(escape((d: any) => d[col] !== val));
        break;
      case 'Начинается на (без учета регистра)':
        aqTable = aqTable.filter(
          escape((d: any) =>
            String(d[col]).toLowerCase().startsWith(String(val).toLowerCase())
          )
        );
        break;
      case 'Начинается на (с учетом регистра)':
        aqTable = aqTable.filter(
          escape((d: any) => String(d[col]).startsWith(String(val)))
        );
        break;
      case 'Заканчивается на (без учета регистра)':
        aqTable = aqTable.filter(
          escape((d: any) =>
            String(d[col]).toLowerCase().endsWith(String(val).toLowerCase())
          )
        );
        break;
      case 'Заканчивается на (с учетом регистра)':
        aqTable = aqTable.filter(
          escape((d: any) => String(d[col]).endsWith(String(val)))
        );
        break;
      case 'Содержит (без учета регистра)':
        aqTable = aqTable.filter(
          escape((d: any) =>
            String(d[col]).toLowerCase().includes(String(val).toLowerCase())
          )
        );
        break;
      case 'Содержит (с учетом регистра)':
        aqTable = aqTable.filter(
          escape((d: any) => String(d[col]).includes(String(val)))
        );
        break;
      case 'Не содержит (без учета регистра)':
        aqTable = aqTable.filter(
          escape(
            (d: any) =>
              !String(d[col]).toLowerCase().includes(String(val).toLowerCase())
          )
        );
        break;
      case 'Не содержит (с учетом регистра)':
        aqTable = aqTable.filter(
          escape((d: any) => !String(d[col]).includes(String(val)))
        );
        break;
      case 'Пусто':
        aqTable = aqTable.filter(
          escape((d: any) => d[col] == null || d[col] === '')
        );
        break;
      case 'Не пусто':
        aqTable = aqTable.filter(
          escape((d: any) => d[col] != null && d[col] !== '')
        );
        break;
      case 'Принадлежит множеству':
        aqTable = aqTable.filter(
          escape((d: any) => Array.isArray(val) && val.includes(d[col]))
        );
        break;
      case 'Не принадлежит множеству':
        aqTable = aqTable.filter(
          escape((d: any) => Array.isArray(val) && !val.includes(d[col]))
        );
        break;
      case 'Больше':
        aqTable = aqTable.filter(escape((d: any) => d[col] > val));
        break;
      case 'Меньше':
        aqTable = aqTable.filter(escape((d: any) => d[col] < val));
        break;
      case 'Больше или равно':
        aqTable = aqTable.filter(escape((d: any) => d[col] >= val));
        break;
      case 'Меньше или равно':
        aqTable = aqTable.filter(escape((d: any) => d[col] <= val));
        break;
      case 'Принадлежит диапазону':
        if (Array.isArray(val) && val.length === 2) {
          aqTable = aqTable.filter(
            escape((d: any) => {
              const date = new Date(d[col]);
              return date >= new Date(val[0]) && date <= new Date(val[1]);
            })
          );
        }
        break;
      default:
        console.warn('Неизвестный тип фильтра:', filter);
        break;
    }
  }

  return aqTable;
}

export function parseDateFromAnyFormat(
  dateString: any,
  format?: string | string[]
): Date | null {
  if (!dateString) return null;

  if (dateString instanceof Date) {
    return dateString;
  }

  if (format) {
    const formats = Array.isArray(format) ? format : [format];
    for (const fmt of formats) {
      const parsed = moment(dateString, fmt, true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
  }

  const defaultFormats = [
    'YYYY-MM-DD',
    'DD.MM.YYYY',
    'MM/DD/YYYY',
    'DD-MM-YYYY',
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'x',
  ];

  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  for (const fmt of defaultFormats) {
    const parsed = moment(dateString, fmt, true);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  const parts = dateString.split(/[-./]/);
  if (parts.length === 3) {
    const variants = [
      { format: 'DD.MM.YYYY', value: `${parts[0]}.${parts[1]}.${parts[2]}` },
      { format: 'DD.MM.YYYY', value: `${parts[1]}.${parts[0]}.${parts[2]}` },
      { format: 'YYYY-MM-DD', value: `${parts[2]}-${parts[1]}-${parts[0]}` },
      { format: 'YYYY-MM-DD', value: `${parts[2]}-${parts[0]}-${parts[1]}` },
    ];

    for (const variant of variants) {
      const parsed = moment(variant.value, variant.format, true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
  }

  console.warn(`Не удалось распарсить дату: ${dateString}`);
  return null;
}

export function formatDate(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString());
}
