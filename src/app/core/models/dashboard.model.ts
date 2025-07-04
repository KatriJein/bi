import { Chart } from './chart.model';

export class Dashboard {
  id: string | undefined;
  name: string | undefined;
  iconID: string | undefined;
  color: string | undefined;
  order: number | undefined;
  charts: Chart[] | undefined;

  constructor(data: Partial<Dashboard>) {
    Object.assign(this, data);
  }

}
