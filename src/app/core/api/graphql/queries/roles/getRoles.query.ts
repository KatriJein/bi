import { gql } from 'apollo-angular';

export const getRolesQuery = gql(`
query GetRoles {
  roles {
    nodes {
      id
      name
    }
  }
}
`);
