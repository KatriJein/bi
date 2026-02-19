import { gql } from 'apollo-angular';

export const deleteUsersInterfaceMutation = gql(`
mutation DeleteUserInterface($interfaceId: UUID!, $order: Int!, $userId: UUID!) {
  deleteUserInterface(
    input: { userId: $userId, interfaceId: $interfaceId, order: $order }
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
