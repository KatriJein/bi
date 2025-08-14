import { gql } from 'apollo-angular';

export const getTablesQuery = gql(`query getTables {
  dbtables {
    nodes {
      tableName
    }
  }
}
`);
