import { gql } from 'apollo-angular';

export const getDatasetQuery = gql(`
  query GetDataset($id: UUID!) {
  dataSet(id: $id) {
    id
    name
    query
    settings
  }
}
`);
