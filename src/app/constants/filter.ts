import { TsType } from '../core/utils';

export type SelectionColumnType = 'string' | 'number' | 'date';
export type FilterableColumnType = SelectionColumnType | 'aggregated';

export const SELECTION_COLUMN_TYPES: Record<SelectionColumnType, string> = {
  string: 'Строка',
  number: 'Число',
  date: 'Дата',
};

export const FILTER_OPTIONS_BY_TYPE: Record<FilterableColumnType, string[]> = {
  string: [
    'Принадлежит множеству',
    'Не принадлежит множеству',
    'Равно',
    'Не равно',
    'Начинается на (без учета регистра)',
    'Начинается на (с учетом регистра)',
    'Заканчивается на (без учета регистра)',
    'Заканчивается на (с учетом регистра)',
    'Содержит (без учета регистра)',
    'Содержит (с учетом регистра)',
    'Не содержит (без учета регистра)',
    'Не содержит (с учетом регистра)',
    'Пусто',
    'Не пусто',
  ],
  number: [
    'Принадлежит множеству',
    'Не принадлежит множеству',
    'Равно',
    'Не равно',
    'Больше',
    'Меньше',
    'Больше или равно',
    'Меньше или равно',
    'Пусто',
    'Не пусто',
  ],
  date: [
    'Принадлежит диапазону',
    'Принадлежит множеству',
    'Не принадлежит множеству',
    'Равно',
    'Не равно',
    'Больше',
    'Меньше',
    'Больше или равно',
    'Меньше или равно',
    'Пусто',
    'Не пусто',
  ],
  aggregated: [
    'Равно',
    'Не равно',
    'Больше',
    'Меньше',
    'Больше или равно',
    'Меньше или равно',
    'Пусто',
    'Не пусто',
  ],
};

export const SELECTION_OPTIONS_BY_TYPE: Record<FilterableColumnType, string[]> =
  {
    string: [
      'Равно',
      'Не равно',
      'Начинается на (без учета регистра)',
      'Начинается на (с учетом регистра)',
      'Заканчивается на (без учета регистра)',
      'Заканчивается на (с учетом регистра)',
      'Содержит (без учета регистра)',
      'Содержит (с учетом регистра)',
      'Не содержит (без учета регистра)',
      'Не содержит (с учетом регистра)',
    ],
    number: [
      'Равно',
      'Не равно',
      'Больше',
      'Меньше',
      'Больше или равно',
      'Меньше или равно',
    ],
    date: [
      'Принадлежит диапазону',
      'Равно',
      'Не равно',
      'Больше',
      'Меньше',
      'Больше или равно',
      'Меньше или равно',
    ],
    aggregated: [
      'Равно',
      'Не равно',
      'Больше',
      'Меньше',
      'Больше или равно',
      'Меньше или равно',
    ],
  };

export function getFilterOptionsByType(
  type: string,
  aggregation?: string
): string[] {
  const normalizedType =
    aggregation && aggregation !== 'NONE' ? 'aggregated' : type;
  return FILTER_OPTIONS_BY_TYPE[normalizedType as FilterableColumnType] ?? [];
}

export function getSelectionOptionsByType(
  type: string,
  aggregation?: string
): string[] {
  const normalizedType =
    aggregation && aggregation !== 'NONE' ? 'aggregated' : type;
  return (
    SELECTION_OPTIONS_BY_TYPE[normalizedType as FilterableColumnType] ?? []
  );
}

export function getAgGridFilterType(
  dataType: TsType
): 'agNumberColumnFilter' | 'agTextColumnFilter' | 'agDateColumnFilter' {
  switch (dataType) {
    case 'number':
      return 'agNumberColumnFilter';
    case 'date':
      return 'agDateColumnFilter';
    default:
      return 'agTextColumnFilter';
  }
}
