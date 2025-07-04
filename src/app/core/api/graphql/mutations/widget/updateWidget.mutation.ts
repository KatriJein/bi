import { gql } from 'apollo-angular';

export const updateWidgetMutation = gql(`
mutation UpdateWidget($id: UUID!, $patch: WidgetPatch!) {
  updateWidget(input: {id: $id, patch: $patch}) {
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
