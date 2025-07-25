import { gql } from 'apollo-angular';

export const updateWidgetFilterBindingMutation = gql(`
mutation UpdateWidgetFilterBinding($id: UUID!, $patch: WidgetFilterBindingPatch!) {
  updateWidgetFilterBinding(input: { patch: $patch, id: $id }) {
    widgetFilterBinding {
      chartFilterId
      dashboardFilterId
      id
      widgetId
    }
  }
}
`);
