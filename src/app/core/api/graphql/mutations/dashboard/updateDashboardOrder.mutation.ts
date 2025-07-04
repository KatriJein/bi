import { gql } from 'apollo-angular';

export const updateDashboardOrderMutation = gql(`
mutation UpdateDashboardOrder($dashboardId: UUID!, $interfaceId: UUID!, $order: Int!, $newOrder: Int) {
  updateInterfaceDashboard(
    input: {patch: {order: $newOrder}, dashboardId: $dashboardId, interfaceId: $interfaceId, order: $order}
  ) {
    interfaceDashboard {
      order
      dashboard {
        id
      }
    }
  }
}
`);
