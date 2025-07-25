import { gql } from 'apollo-angular';

export const createChartFilterMutation = gql(`
mutation CreateChartFilter(
  $chartId: UUID!
  $fieldName: String!
  $fieldType: String!
  $filterType: String!
) {
  createChartFilter(
    input: {
      chartFilter: {
        chartId: $chartId
        fieldName: $fieldName
        filterType: $filterType
        fieldType: $fieldType
      }
    }
  ) {
    chartFilter {
      chartId
      fieldName
      fieldType
      filterType
      id
    }
  }
}

  `);
