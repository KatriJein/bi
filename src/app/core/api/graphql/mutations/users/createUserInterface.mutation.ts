import { gql } from 'apollo-angular';

export const createUsersInterfaceMutation = gql(`
mutation CreateUserInterface($interfaceId: UUID!, $order: Int, $userId: UUID!) {
  createUserInterface(
    input: {
      userInterface: {
        userId: $userId
        interfaceId: $interfaceId
        order: $order
      }
    }
  ) {
    user {
      id
    }
    userInterface {
      interfaceId
    }
  }
}
`);
