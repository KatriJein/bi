import { gql } from 'apollo-angular';

export const updateUserRoleMutation = gql(`
mutation UpdateUserRole($userId: UUID!, $roleId: UUID!, $roleId1: UUID) {
  updateUserRole(
    input: { patch: { roleId: $roleId1 }, userId: $userId, roleId: $roleId }
  ) {
    userRole {
      roleId
    }
    user {
      id
    }
  }
}
`);
