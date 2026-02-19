import { gql } from 'apollo-angular';

export const getUsersQuery =
  gql(`
query GetUsers {
  users {
    nodes {
      id
      name
      userRoles {
        nodes {
          roleId
        }
      }
      userInterfaces {
        nodes {
          interfaceId
        }
      }
      password
    }
  }
}
`);
