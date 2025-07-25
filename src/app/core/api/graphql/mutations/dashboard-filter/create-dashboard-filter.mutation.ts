import { gql } from 'apollo-angular';

export const createDashboardFilterMutation = gql(`
 mutation CreateDashboardFilter(
  $dashboardId: UUID!
  $fieldType: String!
  $filterType: String!
  $name: String!
) {
  createDashboardFilter(
    input: {
      dashboardFilter: {
        dashboardId: $dashboardId
        name: $name
        fieldType: $fieldType
        filterType: $filterType
      }
    }
  ) {
    dashboardFilter {
      dashboardId
      fieldType
      filterType
      id
      name
    }
  }
}

  `);
