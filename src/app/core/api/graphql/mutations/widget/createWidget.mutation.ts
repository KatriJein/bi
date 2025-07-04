import { gql } from 'apollo-angular';

export const createWidgetMutation = gql(`
mutation createWidget($chartId: UUID, $dashboardId: UUID!, $position: JSON, $title: String, $type: String!, $visualSettings: JSON) {
  createWidget(
    input: {widget: {dashboardId: $dashboardId, type: $type, chartId: $chartId, position: $position, title: $title, visualSettings: $visualSettings}}
  ) {
    widget {
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
