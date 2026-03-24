import { Column, Dataset } from '../../core/models';
import { toCamelCase } from '../../core/utils';

// Поиск колонки по имени
export function findColumnByName(
  name: string | undefined,
  dataset: Dataset,
): Column | null {
  if (!name || !dataset.columns?.length) return null;

  const normalizedSearch = toCamelCase(name);

  for (const column of dataset.columns) {
    const original = column.columnName;
    const normalized = toCamelCase(original);

    if (original === name) return column;
    if (normalized === normalizedSearch) return column;
    if (original === normalizedSearch) return column;
    if (normalized === name) return column;
  }

  return null;
}

// Поиск колонок по именам
export function findColumnsByNames(
  names: string[] | undefined,
  dataset: Dataset
): Column[] {
  if (!names || !dataset.columns) return [];
  return names
    .map((name) => {
      const exactMatch = dataset.columns!.find((c) => c.columnName === name);
      if (exactMatch) return exactMatch;

      const camelCaseSearch = toCamelCase(name);
      return dataset.columns!.find(
        (c) => toCamelCase(c.columnName) === camelCaseSearch
      );
    })
    .filter((c): c is Column => !!c);
}
