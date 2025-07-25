import { gql } from 'apollo-angular';

export const deleteWidgetFilterBindingMutation = gql(`
mutation DeleteWidgetFilterBinding($id: UUID!) {
  deleteWidgetFilterBinding(input: { id: $id }) {
    widgetFilterBinding {
      id
    }
  }
}
`);
