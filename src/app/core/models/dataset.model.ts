import { TableColumn } from '../api/graphql/types';

export class Dataset {
  id: string | undefined;
  connection: string | undefined;
  query: string | undefined;
  settings: Object | undefined;
  tableName: string | undefined;
  name: string | undefined;
  columns: Column[] | undefined;

  constructor(data: Partial<Dataset>) {
    Object.assign(this, data);
  }

}

export interface Column extends TableColumn {
  alias: string;
  isVisible: boolean;
  aggregate: string;
  direction?: 'asc' | 'desc';
}
