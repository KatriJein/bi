import { gql } from 'apollo-angular';

export const getUserQuery =
  gql(`query getUser($name: String!, $password: String!) {
  users(
    condition: {name: $name, password: $password }
  ) {
    edges {
      node {
        id
        name
      }
    }
  }
}
`);
