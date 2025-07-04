import { gql } from 'apollo-angular';

export const createDatasetMutation = gql(`
mutation createDataset($query: String!, $settings: String!, $name: String!) {
  createDataSet(input: {dataSet: {query: $query, settings: $settings, name: $name}}) {
    dataSet {
      id
      name
      query
      settings
    }
  }
}
`);
