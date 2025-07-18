export function toCamelCase(snake: string): string {
  return snake
    .replace(/_+([a-zA-Z0-9])/g, (_, letter) => letter.toUpperCase())
    .replace(/_+/g, '');
}

export type TsType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'date'
  | 'unknown';

export function mapPostgresTypeToTs(type: string): TsType {
  const normalized = type.toLowerCase();
  if (
    [
      'character',
      'char',
      'varchar',
      'character varying',
      'text',
      'name',
    ].includes(normalized)
  ) {
    return 'string';
  } else if (
    [
      'int',
      'int4',
      'int8',
      'integer',
      'bigint',
      'smallint',
      'numeric',
      'float',
      'double precision',
      'real',
    ].includes(normalized)
  ) {
    return 'number';
  } else if (['bool', 'boolean'].includes(normalized)) {
    return 'boolean';
  } else if (['json', 'jsonb'].includes(normalized)) {
    return 'object';
  } else if (
    ['date', 'datetime', 'timestamp', 'timestamp with time zone'].includes(
      normalized
    )
  ) {
    return 'date';
  } else {
    return 'unknown';
  }
}
