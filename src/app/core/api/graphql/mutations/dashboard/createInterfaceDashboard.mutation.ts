import { gql } from 'apollo-angular';

export const createInterfaceDashboardMutation = gql(`
mutation createInterfaceDashboard($dashboardId: UUID!, $interfaceId: UUID!, $order: Int) {
  createInterfaceDashboard(
    input: {interfaceDashboard: {interfaceId: $interfaceId, dashboardId: $dashboardId, order: $order}}
  ) {
    interfaceDashboard {
      order
      dashboard {
        color
        iconId
        id
        name
      }
    }
  }
}
`);
