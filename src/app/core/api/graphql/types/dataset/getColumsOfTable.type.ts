import { TsType } from '../../../../utils';

export type GetTableColumnsType = {
  dbfields: {
    nodes: TableColumn[];
  };
};

export type TableColumn = {
  tableName: string;
  columnName: string;
  dataType: TsType;
};
