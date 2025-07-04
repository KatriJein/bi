import { gql } from 'apollo-angular';

export const deleteInterfaceDashboardMutation = gql(`
mutation deleteInterfaceDashboard($dashboardId: UUID!, $interfaceId: UUID!, $order: Int!) {
  deleteInterfaceDashboard(
    input: {dashboardId: $dashboardId, interfaceId: $interfaceId, order: $order}
  ) {
    dashboard {
      id
    }
  }
}
`);
