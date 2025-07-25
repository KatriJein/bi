import { gql } from 'apollo-angular';

export const getWidgetFilterBindingQuery = gql(`query GetWidgetFilterBinding {
  widgetFilterBindings {
    nodes {
      chartFilterId
      dashboardFilterId
      id
      widgetId
    }
  }
}
`);
