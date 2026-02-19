import { gql } from 'apollo-angular';

export const deleteUserRoleMutation = gql(`
mutation DeleteUserRole($roleId: UUID!, $userId: UUID!) {
  deleteUserRole(input: {userId: $userId, roleId: $roleId}) {
    user {
      id
    }
  }
}
`);
