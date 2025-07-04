import { gql } from 'apollo-angular';

export const updateDashboardMutation = gql(`
mutation UpdateDashboard($id: UUID!, $patch: DashboardPatch!) {
  updateDashboard(input: {patch: $patch, id: $id}) {
    dashboard {
      color
      iconId
      id
      name
    }
  }
}
`);
