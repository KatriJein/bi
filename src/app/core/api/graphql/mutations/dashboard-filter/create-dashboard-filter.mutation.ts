import { gql } from 'apollo-angular';

export const createDashboardFilterMutation = gql(`
mutation CreateDashboardFilter(
  $dashboardId: UUID!
  $fieldType: String!
  $filterType: String!
  $name: String!
  $value: JSON!
  $isMultiple: Boolean
  $dateGranularity: String
) {
  createDashboardFilter(
    input: {
      dashboardFilter: {
        dashboardId: $dashboardId
        name: $name
        fieldType: $fieldType
        filterType: $filterType
        value: $value
        isMultiple: $isMultiple
        dateGranularity: $dateGranularity
      }
    }
  ) {
    dashboardFilter {
      dashboardId
      fieldType
      filterType
      id
      name
      value
      isMultiple
      dateGranularity
    }
  }
}
  `);
