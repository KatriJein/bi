import { gql } from 'apollo-angular';

export const getDatasetsQuery = gql(`query getDatasets {
    dataSets {
      nodes {
        id
        name
        query
        settings
      }
    }
  }
`);
