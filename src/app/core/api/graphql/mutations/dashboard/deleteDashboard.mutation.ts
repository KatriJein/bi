import { gql } from 'apollo-angular';

export const deleteDashboardMutation = gql(`
mutation deleteDashboard($id: UUID!) {
  deleteDashboard(input: {id: $id}) {
    dashboard {
      id
    }
  }
}
`);
