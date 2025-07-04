import { gql } from 'apollo-angular';

export const createInterfaceMutation = gql(`
mutation CreateInterface($name: String!) {
  createInterface(input: {interface: {name: $name}}) {
    interface {
      id
    }
  }
}
`);
