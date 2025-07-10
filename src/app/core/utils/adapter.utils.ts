import { ChartDto, FilterType, SortingType } from '../store/charts';

export function toChartCreateRequest(dto: ChartDto): {
  name: string;
  datasetId: string;
  xAxis: string;
  yAxis: string[];
  filters?: FilterType[];
  sorting?: SortingType[];
  settings?: Record<string, any>;
  childId?: string | null;
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
    filters: dto.filters ?? [],
    sorting: dto.sorting ?? undefined,
    settings: dto.settings ?? {},
    childId: dto.childId ?? null,
  };
}
