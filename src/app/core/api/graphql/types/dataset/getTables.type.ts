export type GetTablesType = {
  dbtablesBookings: {
    nodes: Table[];
  };
};

export type Table = {
  tableName: string;
};
