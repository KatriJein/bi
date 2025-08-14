export type GetTablesType = {
  dbtables: {
    nodes: Table[];
  };
};

export type Table = {
  tableName: string;
};
