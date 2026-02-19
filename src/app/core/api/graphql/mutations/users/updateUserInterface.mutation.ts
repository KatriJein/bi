import { gql } from 'apollo-angular';

export const updateUserInterfaceMutation = gql(`
mutation UpdateUserInterface($interfaceId: UUID!, $order: Int!, $order1: Int, $interfaceId1: UUID, $userId: UUID!) {
  updateUserInterface(
    input: {patch: {interfaceId: $interfaceId1, order: $order1}, userId: $userId, interfaceId: $interfaceId, order: $order}
  ) {
    user {
      id
      name
    }
    userInterface {
      interfaceId
      order
    }
  }
}
`);
