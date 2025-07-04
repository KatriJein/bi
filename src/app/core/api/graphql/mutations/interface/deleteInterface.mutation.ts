import { gql } from 'apollo-angular';

export const deleteInterfaceMutation = gql(`
mutation deleteInterface($id: UUID!) {
  deleteInterface(input: {id: $id}) {
    interface {
      id
    }
  }
}
`);
