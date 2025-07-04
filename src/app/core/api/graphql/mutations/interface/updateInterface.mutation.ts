import { gql } from 'apollo-angular';

export const updateInterfaceMutation = gql(`
mutation UpdateInterface($id: UUID!, $name: String) {
  updateInterface(input: {patch: {name: $name}, id: $id}) {
    interface {
      id
      name
      userInterfaces {
        nodes {
          order
        }
      }
    }
  }
}
`);
