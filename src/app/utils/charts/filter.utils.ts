import { from, escape, ColumnTable } from 'arquero';
import { toCamelCase } from '../../core/utils';
import { filterType } from '../../core/store/charts';

export function applyFilters(
  data: Record<string, any>[],
  filters: filterType[]
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
