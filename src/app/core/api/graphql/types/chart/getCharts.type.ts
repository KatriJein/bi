import { ChartDto } from '../../../../store/charts';

export type GetChartsType = {
  charts: {
    nodes: Array<ChartDto>;
  };
};
