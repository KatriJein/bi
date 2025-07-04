import { ChartDto, sortingType } from '../store/charts';

export function toChartCreateRequest(dto: ChartDto): {
  name: string;
  datasetId: string;
  xAxis: string;
  yAxis: string[];
  filters?: Record<string, any>;
  sorting?: sortingType[];
  settings?: Record<string, any>;
} {
  if (!dto.name || !dto.datasetId || !dto.yAxis?.length) {
    throw new Error('Invalid chart data: missing required fields');
  }

  if (dto.settings?.chartType !== 'table' && !dto.xAxis) {
    throw new Error('Invalid chart data: missing required fields');
  }

  return {
    name: dto.name,
    datasetId: dto.datasetId,
    xAxis: dto.xAxis ?? '',
    yAxis: dto.yAxis,
    filters: dto.filters ?? {},
    sorting: dto.sorting ?? undefined,
    settings: dto.settings ?? {},
  };
}
