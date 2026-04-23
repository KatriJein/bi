export function toCamelCase(snake: string): string {
  const parts = snake.split('_').filter(Boolean);
  if (parts.length <= 1) {
    return parts[0]?.toLowerCase() || '';
  }
  return parts
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

export function pluralizeTableName(tableName: string): string {
  if (!tableName) return tableName;

  const parts = tableName.split('_');
  if (parts.length === 0) return tableName;

  const lastWord = parts[parts.length - 1];
  if (!lastWord) return tableName;

  const pluralizeWord = (word: string): string => {
    const lowerWord = word.toLowerCase();

    const alreadyPlural = [
      'data',
      'criteria',
      'media',
      'phenomena',
      'children',
      'women',
      'men',
      'people',
      'teeth',
      'feet',
      'geese',
      'mice',
      'oxen',
      'series',
      'species',
      'news',
      'analytics',
    ];
    if (alreadyPlural.includes(lowerWord)) {
      return word;
    }

    const exceptions: Record<string, string> = {
      child: 'children',
      man: 'men',
      woman: 'women',
      person: 'people',
      mouse: 'mice',
      tooth: 'teeth',
      foot: 'feet',
      goose: 'geese',
      ox: 'oxen',
      index: 'indices',
      matrix: 'matrices',
      vertex: 'vertices',
      appendix: 'appendices',
      phenomenon: 'phenomena',
      criterion: 'criteria',
      datum: 'data',
      basis: 'bases',
      analysis: 'analyses',
      thesis: 'theses',
      crisis: 'crises',
    };
    if (exceptions[lowerWord]) {
      return exceptions[lowerWord];
    }

    const singularEndsWithS = [
      'status',
      'bus',
      'virus',
      'canvas',
      'atlas',
      'bias',
      'cosmos',
    ];
    if (singularEndsWithS.some((s) => lowerWord === s)) {
      return word + 'es';
    }

    if (
      word.endsWith('x') ||
      word.endsWith('z') ||
      word.endsWith('ch') ||
      word.endsWith('sh')
    ) {
      return word + 'es';
    }

    if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
      return word.slice(0, -1) + 'ies';
    }

    if (word.endsWith('fe')) {
      return word.slice(0, -2) + 'ves';
    }
    if (word.endsWith('f') && !word.endsWith('ff')) {
      return word.slice(0, -1) + 'ves';
    }

    if (
      word.endsWith('o') &&
      !['photo', 'piano', 'halo', 'demo'].some((w) => word.endsWith(w))
    ) {
      return word + 'es';
    }

    if (word.endsWith('s')) {
      return word;
    }

    return word + 's';
  };

  const pluralizedLastWord = pluralizeWord(lastWord);
  parts[parts.length - 1] = pluralizedLastWord;

  return parts.join('_');
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
