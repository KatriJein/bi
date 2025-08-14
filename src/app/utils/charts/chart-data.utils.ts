import { map, Observable } from 'rxjs';
import { Column } from '../../core/models';
import { pluralizeTableName, toCamelCase } from '../../core/utils';
import { FilterColumn } from '../../services/chart-state.service';
import { ChartDto, ChartType } from '../../core/store/charts';
import { ChartService } from '../../core/api/services';
import { getAggregatedData } from './aggregate.utils';
import { ChartConfiguration } from 'chart.js';

export function collectAllColumns(
  xAxis: Column | null,
  yAxis: Column[],
  filters: FilterColumn[],
  sorting: (Column & { direction: 'asc' | 'desc' })[]
): Column[] {
  const allColsMap = new Map<string, Column>();
  [xAxis, ...yAxis, ...filters, ...sorting].forEach((col) => {
    if (col && !allColsMap.has(col.columnName)) {
      allColsMap.set(col.columnName, col);
    }
  });
  return Array.from(allColsMap.values());
}

export function groupColumnsByTable(
  columns: Column[]
): Record<string, Column[]> {
  return columns.reduce<Record<string, Column[]>>((acc, col) => {
    const table = toCamelCase(pluralizeTableName(col.tableName || ''));
    if (!acc[table]) acc[table] = [];
    acc[table].push(col);
    return acc;
  }, {});
}

export function createChartDataRequests(
  colsByTable: Record<string, Column[]>,
  chartService: ChartService
): Observable<{ tableName: string; data: Record<string, any>[] }>[] {
  return Object.entries(colsByTable).map(([tableName, columns]) => {
    const colNames = columns.map((c) => toCamelCase(c.columnName));
    return chartService
      .getData(tableName, colNames)
      .pipe(map((data) => ({ tableName, data })));
  });
}

export function processChartData(
  data: Record<string, any>[],
  xAxis: string,
  yAxis: Column[],
  sorting: (Column & { direction: 'asc' | 'desc' })[],
  filters: FilterColumn[]
): any[] {
  return getAggregatedData(data, xAxis, yAxis, sorting, filters);
}

export function normalizeChartType(
  chartType: ChartType
): ChartConfiguration['type'] {
  switch (chartType) {
    case 'horizontalBar':
      return 'bar';
    case 'doughnutPercent':
      return 'doughnut';
    case 'table':
      throw new Error('Table type should be handled separately');
    default:
      return chartType;
  }
}
