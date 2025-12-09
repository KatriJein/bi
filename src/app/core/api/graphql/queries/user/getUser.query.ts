import { gql } from 'apollo-angular';

export const getUserQuery =
  gql(`
query getUser($name: String!, $password: String!) {
  users(condition: {name: $name, password: $password}) {
    edges {
      node {
        id
        name
        userRoles {
          nodes {
            role {
              id
              name
            }
          }
        }
      }
    }
  }
}
`);

// export const getUserQuery = gql(`
// mutation GetUser($username: String!, $password: String!) {
//   authenticate(input: { username: $username, password: $password }) {
//     jwtToken
//     query {
//       users(condition: { name: $username }) {
//         nodes {
//           id
//           name
//         }
//       }
//     }
//   }
// }
// `);
