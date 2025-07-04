import { gql } from 'apollo-angular';

export const getChartsQuery = gql(`query getCharts {
  charts {
    nodes {
      name
      datasetId
      filters
      sorting
      id
      settings
      xAxis
      yAxis
    }
  }
}
`);
