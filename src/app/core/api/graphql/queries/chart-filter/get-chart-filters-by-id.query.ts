import { gql } from 'apollo-angular';

export const getChartFiltersByIdQuery = gql(`
query GetChartFiltersById($chartId: UUID) {
  chartFilters(condition: { chartId: $chartId }) {
    nodes {
      chartId
      fieldName
      fieldType
      filterType
      id
      name
    }
  }
}
`);
