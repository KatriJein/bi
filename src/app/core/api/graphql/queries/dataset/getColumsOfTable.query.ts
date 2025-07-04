import { gql } from 'apollo-angular';

export const getColumsOfTableQuery =
  gql(`query getTableColumnsOnly($name: SqlIdentifier!) {
  dbfieldsBookings(condition: {tableName: $name}) {
    nodes {
      tableName
      dataType
      columnName
    }
  }
}
`);
