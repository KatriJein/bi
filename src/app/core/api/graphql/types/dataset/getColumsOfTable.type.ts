import { TsType } from '../../../../utils';

export type GetTableColumnsType = {
  dbfieldsBookings: {
    nodes: TableColumn[];
  };
};

export type TableColumn = {
  tableName: string;
  columnName: string;
  dataType: TsType;
};
