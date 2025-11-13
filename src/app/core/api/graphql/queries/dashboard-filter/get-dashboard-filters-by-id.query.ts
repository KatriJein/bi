import { gql } from 'apollo-angular';

export const getDashboardFiltersByIdQuery = gql(`
query GetDashboardFiltersById($dashboardId: UUID) {
  dashboardFilters(condition: { dashboardId: $dashboardId }) {
    nodes {
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
