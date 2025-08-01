import { gql } from 'apollo-angular';

export const getChartFiltersQuery = gql(`
query GetChartFilters {
  chartFilters {
    nodes {
      chartId
      filterType
      fieldType
      fieldName
      id
      name
    }
  }
}
`);
