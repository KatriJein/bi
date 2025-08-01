export type CreateChartFilterResponse = {
  createChartFilter: {
    chartFilter: ChartFilter;
  };
};

export type CreateChartFilterVariables = {
  chartId: string;
  name: string;
  fieldName: string;
  filterType: string;
  fieldType: string;
};

export type ChartFilter = {
  id: string;
  name: string;
  chartId: string;
  fieldName: string;
  filterType: string;
  fieldType: string;
};
