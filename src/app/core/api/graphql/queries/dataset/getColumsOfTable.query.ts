import { gql } from 'apollo-angular';

export const getColumsOfTableQuery =
  gql(`query getTableColumnsOnly($name: SqlIdentifier!) {
  dbfields(condition: {tableName: $name}) {
    nodes {
      tableName
      dataType
      columnName
    }
  }
}
`);
