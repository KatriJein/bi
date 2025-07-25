export type CreateChartFilterResponse = {
  createChartFilter: {
    chartFilter: ChartFilter;
  };
};

export type CreateChartFilterVariables = {
  chartId: string;
  fieldName: string;
  filterType: string;
  fieldType: string;
};

export type ChartFilter = {
  id: string;
  chartId: string;
  fieldName: string;
  filterType: string;
  fieldType: string;
};
