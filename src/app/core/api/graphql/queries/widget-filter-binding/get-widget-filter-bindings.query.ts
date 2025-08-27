import { gql } from 'apollo-angular';

export const getWidgetFilterBindingQuery =
  gql(`query WidgetFilterBindings($widgetId: UUID) {
  widgetFilterBindings(condition: { widgetId: $widgetId }) {
    nodes {
      chartFilterId
      dashboardFilterId
      id
      widgetId
    }
  }
}
`);
