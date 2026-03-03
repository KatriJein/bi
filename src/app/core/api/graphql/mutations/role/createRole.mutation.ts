import { gql } from 'apollo-angular';

export const createRoleMutation = gql(`
mutation CreateRole($permissions: JSON, $name: String!) {
  createRole(input: {role: {name: $name, permissions: $permissions}}) {
    clientMutationId
  }
}
`);
