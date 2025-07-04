import { Dataset } from './dataset.model';

export class Chart {
  id: string | undefined;
  dataSet: Dataset | undefined;
  xAxis: string[] | undefined;
  yAxis: string[] | undefined;
  filters: string[] | undefined;
  groupBy: string[] | undefined;
  settings: Object | undefined;

  constructor(data: Partial<Chart>) {
    Object.assign(this, data);
  }
}
