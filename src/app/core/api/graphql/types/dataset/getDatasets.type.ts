export type Dataset = {
  id: string;
  name: string;
  query: string;
  settings: string;
};

export type GetDatasetsType = {
  dataSets: {
    nodes: Dataset[];
  };
};

export type SettingsColumn = {
  title: string;
  name: string;
  tableName: string;
  type: string;
  visible: boolean;
  aggregate: string;
};
