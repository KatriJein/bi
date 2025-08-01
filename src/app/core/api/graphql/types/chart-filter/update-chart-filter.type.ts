import { ChartFilter } from './create-chart-filter.type';

export type UpdateChartFilterResponse = {
  updateChartFilter: {
    chartFilter: ChartFilter;
  };
};

export type UpdateChartFilterVariables = {
  id: string;
  patch: {
    chartId?: string;
    name?: string;
    fieldName?: string;
    filterType?: string;
    fieldType?: string;
  };
};
