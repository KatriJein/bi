import { gql } from 'apollo-angular';

export const deleteUserInterfaceMutation = gql(`
mutation deleteUserInterface($interfaceId: UUID!, $order: Int!, $userId: UUID!) {
  deleteUserInterface(
    input: {userId: $userId, interfaceId: $interfaceId, order: $order}
  ) {
    interface {
      id
    }
  }
}
`);
