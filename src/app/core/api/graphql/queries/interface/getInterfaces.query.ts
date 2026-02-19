import { gql } from 'apollo-angular';

export const getInterfacesQuery = gql(`
query GetInterfaces {
  interfaces {
    nodes {
      id
      name
    }
  }
}
`);
