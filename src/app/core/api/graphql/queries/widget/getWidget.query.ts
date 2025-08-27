import { gql } from 'apollo-angular';

export const getWidgetQuery = gql(`
query GetWidget($id: UUID!) {
  widget(id: $id) {
    chartId
    dashboardId
    id
    position
    title
    type
    visualSettings
  }
}
`);
