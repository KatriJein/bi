import { gql } from 'apollo-angular';

export const getWidgetsQuery = gql(`
query GetWidgets($dashboardId: UUID) {
  widgets(condition: {dashboardId: $dashboardId}) {
    nodes {
      chartId
      dashboardId
      id
      position
      title
      type
      visualSettings
    }
  }
}
`);
