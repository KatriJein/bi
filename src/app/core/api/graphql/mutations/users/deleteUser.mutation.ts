import { gql } from 'apollo-angular';

export const deleteUserMutation = gql(`
mutation DeleteUser($id: UUID!) {
  deleteUser(input: {id: $id}) {
    user {
      id
    }
  }
}
`);
