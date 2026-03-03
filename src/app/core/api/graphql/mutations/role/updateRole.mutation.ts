import { gql } from 'apollo-angular';

export const updateRoleMutation = gql(`
mutation UpdateRole($id: UUID!, $name: String, $permissions: JSON) {
  updateRole(
    input: { patch: { name: $name, permissions: $permissions }, id: $id }
  ) {
    clientMutationId
  }
}
`);
