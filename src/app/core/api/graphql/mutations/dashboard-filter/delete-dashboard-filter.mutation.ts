import { gql } from 'apollo-angular';

export const deleteDashboardFilterMutation = gql(`
mutation DeleteDashboardFilter($id: UUID!) {
  deleteDashboardFilter(input: { id: $id }) {
    dashboardFilter {
      id
    }
  }
}
`);
