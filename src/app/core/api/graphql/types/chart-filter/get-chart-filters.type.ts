import { ChartFilter } from './create-chart-filter.type';

export type GetChartFiltersResponse = {
  chartFilters: {
    nodes: ChartFilter[];
  };
};
