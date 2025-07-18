import { op, desc } from 'arquero';
import { Column } from '../../core/models';
import { FilterType, SortingType } from '../../core/store/charts';
import { toCamelCase } from '../../core/utils';
import { applyFilters } from './filter.utils';

type AggregateType = 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN' | 'NONE';

export function getAggregatedData(
  data: Record<string, any>[],
  xAxis: string,
  yAxis: Column[],
  sorting: SortingType[] | null,
  filters: FilterType[] | null
): any[] {
  if (!data || data.length === 0) return [];

  const aggregations = yAxis.map((col) => ({
    column: toCamelCase(col.columnName),
    aggregate: col.aggregate as AggregateType,
  }));



  const hasNone = aggregations.some((a) => a.aggregate === 'NONE');

  if (hasNone && aggregations.every((a) => a.aggregate === 'NONE')) {
    const sortingColumns = (sorting ?? []).map((s) =>
      s.direction === 'desc'
        ? desc(toCamelCase(s.columnName))
        : toCamelCase(s.columnName)
    );

    const table = applyFilters(data, filters ?? []);

    return table.orderby(...sortingColumns).objects();
  }

  const rollupObj: Record<string, any> = {};
  for (const { column, aggregate } of aggregations) {
    if (aggregate === 'SUM') rollupObj[column] = op.sum(column);
    else if (aggregate === 'AVG') rollupObj[column] = op.mean(column);
    else if (aggregate === 'COUNT') rollupObj[column] = op.count();
    else if (aggregate === 'MAX') rollupObj[column] = op.max(column);
    else if (aggregate === 'MIN') rollupObj[column] = op.min(column);
    else if (aggregate === 'NONE') rollupObj[column] = op.any(column);
  }

  for (const { columnName } of sorting ?? []) {
    const camel = toCamelCase(columnName);
    if (!rollupObj[camel]) {
      rollupObj[camel] = op.any(camel);
    }
  }

  try {
    let table = applyFilters(data, filters ?? []);
    if (!!xAxis && xAxis !== '') {
      table = table.groupby(toCamelCase(xAxis));
    }

    const result = table.rollup(rollupObj);

    const sortingColumns = (sorting ?? []).map((s) =>
      s.direction === 'desc'
        ? desc(toCamelCase(s.columnName))
        : toCamelCase(s.columnName)
    );
    return result.orderby(...sortingColumns).objects();
  } catch (err) {
    console.error('Failed to build Arquero table:', err);
    return [];
  }
}
