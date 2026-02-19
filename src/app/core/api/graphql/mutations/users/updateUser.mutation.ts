import { gql } from 'apollo-angular';

export const updateUserMutation = gql(`
mutation UpdateUser($id: UUID!, $password: String, $name: String) {
  updateUser(input: {patch: {name: $name, password: $password}, id: $id}) {
    user {
      id
      name
      password
    }
  }
}
`);
