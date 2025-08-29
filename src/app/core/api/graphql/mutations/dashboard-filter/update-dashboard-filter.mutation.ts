import { gql } from 'apollo-angular';

export const updateDashboardFilterMutation = gql(`
mutation UpdateDashboardFilter($id: UUID!, $patch: DashboardFilterPatch!) {
  updateDashboardFilter(input: { patch: $patch, id: $id }) {
    dashboardFilter {
      dashboardId
      fieldType
      filterType
      id
      name
      value
      isMultiple
    }
  }
}
`);
