import { gql } from 'apollo-angular';

export const createWidgetFilterBindingMutation = gql(`
mutation CreateWidgetFilterBinding(
  $chartFilterId: UUID!
  $dashboardFilterId: UUID!
  $widgetId: UUID!
) {
  createWidgetFilterBinding(
    input: {
      widgetFilterBinding: {
        widgetId: $widgetId
        dashboardFilterId: $dashboardFilterId
        chartFilterId: $chartFilterId
      }
    }
  ) {
    widgetFilterBinding {
      chartFilterId
      dashboardFilterId
      id
      widgetId
    }
  }
}

  `);
