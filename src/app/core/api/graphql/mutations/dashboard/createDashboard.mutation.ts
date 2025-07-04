import { gql } from 'apollo-angular';

export const createDashboardMutation = gql(`
mutation createDashboard($name: String!) {
  createDashboard(input: {dashboard: {name: $name}}) {
    dashboard {
      id
    }
  }
}
`);
