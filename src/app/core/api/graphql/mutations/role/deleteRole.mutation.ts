import { gql } from 'apollo-angular';

export const deleteRoleMutation = gql(`
mutation DeleteRole($id: UUID!) {
  deleteRole(input: {id: $id}) {
    clientMutationId
  }
}
`);
