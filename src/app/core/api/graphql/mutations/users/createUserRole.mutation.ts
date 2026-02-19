import { gql } from 'apollo-angular';

export const createUserRoleMutation = gql(`
mutation CreateUserRole($roleId: UUID!, $userId: UUID!) {
  createUserRole(input: { userRole: { userId: $userId, roleId: $roleId } }) {
    user {
      id
      name
      password
      userRoles {
        nodes {
          userId
        }
      }
    }
  }
}
`);
