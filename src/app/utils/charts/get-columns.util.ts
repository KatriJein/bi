import { Column, Dataset } from '../../core/models';
import { toCamelCase } from '../../core/utils';

// Поиск колонки по имени
export function findColumnByName(
  name: string | undefined,
  dataset: Dataset
): Column | null {
  if (!name || !dataset.columns) return null;

  const exactMatch = dataset.columns.find((c) => c.columnName === name);
  if (exactMatch) return exactMatch;

  const camelCaseSearch = toCamelCase(name);
  return (
    dataset.columns.find(
      (c) => toCamelCase(c.columnName) === camelCaseSearch
    ) ?? null
  );
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
