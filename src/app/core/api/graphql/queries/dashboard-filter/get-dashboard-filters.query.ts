import { gql } from 'apollo-angular';

export const getDashboardFiltersQuery = gql(`
query GetDashboardFilters {
  dashboardFilters {
    nodes {
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
