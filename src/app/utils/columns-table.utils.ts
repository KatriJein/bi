export const fieldTypes = [
  {
    value: 'date',
    label: 'Дата',
    icon: 'event',
  },
  {
    value: 'boolean',
    label: 'Логический',
    icon: 'toggle_on',
  },
  {
    value: 'string',
    label: 'Строка',
    icon: 'short_text',
  },
  {
    value: 'number',
    label: 'Число',
    icon: 'pin',
  },
  {
    value: 'object',
    label: 'Объект',
    icon: 'data_object',
  },
  {
    value: 'unknown',
    label: 'Неизвестный',
    icon: 'help_outline',
  },
];

export const aggregateLabelMap: Record<string, string> = {
  SUM: 'Сумма',
  AVG: 'Среднее',
  MIN: 'Минимум',
  MAX: 'Максимум',
  COUNT: 'Количество',
  NONE: 'Без агрегации',
};

export const aggregateOptionsByType: Record<string, string[]> = {
  string: ['COUNT', 'NONE'],
  number: ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'NONE'],
  boolean: ['COUNT', 'NONE'],
  date: ['MIN', 'MAX', 'COUNT', 'NONE'],
  object: ['NONE'],
  unknown: ['NONE'],
};
