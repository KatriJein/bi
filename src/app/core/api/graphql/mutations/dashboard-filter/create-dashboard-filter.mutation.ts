import { gql } from 'apollo-angular';

export const createDashboardFilterMutation = gql(`
mutation CreateDashboardFilter(
  $dashboardId: UUID!
  $fieldType: String!
  $filterType: String!
  $name: String!
  $value: JSON!
) {
  createDashboardFilter(
    input: {
      dashboardFilter: {
        dashboardId: $dashboardId
        name: $name
        fieldType: $fieldType
        filterType: $filterType
        value: $value
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
    }
  }
}
  `);
