import { gql } from 'apollo-angular';

export const createDashboardMutation = gql(`
mutation createDashboard($name: String!, $parentId: UUID) {
  createDashboard(input: { dashboard: { name: $name, parentId: $parentId } }) {
    dashboard {
      id
    }
  }
}
`);
