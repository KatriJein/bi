import { Column, Dataset } from '../../core/models';

// Поиск колонки по имени
export function findColumnByName(
  name: string | undefined,
  dataset: Dataset
): Column | null {
  if (!name || !dataset.columns) return null;
  return dataset.columns.find((c) => c.columnName === name) ?? null;
}

// Поиск колонок по именам
export function findColumnsByNames(
  names: string[] | undefined,
  dataset: Dataset
): Column[] {
  if (!names || !dataset.columns) return [];
  return names
    .map((name) => dataset.columns!.find((c) => c.columnName === name))
    .filter((c): c is Column => !!c);
}
