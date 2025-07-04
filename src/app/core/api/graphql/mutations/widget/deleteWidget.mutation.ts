import { gql } from 'apollo-angular';

export const deleteWidgetMutation = gql(`
mutation DeleteWidget($id: UUID!) {
  deleteWidget(input: {id: $id}) {
    widget {
      id
    }
  }
}
`);
