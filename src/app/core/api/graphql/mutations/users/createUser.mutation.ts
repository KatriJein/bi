import { gql } from 'apollo-angular';

export const createUserMutation = gql(`
mutation CreateUser($password: String, $name: String!) {
  createUser(input: { user: { name: $name, password: $password } }) {
    user {
      id
      name
      password
    }
  }
}
`);
