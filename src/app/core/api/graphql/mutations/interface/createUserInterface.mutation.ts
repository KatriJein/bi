import { gql } from 'apollo-angular';

export const createUserInterfaceMutation = gql(`
  mutation AttachInterface(
    $interfaceId: UUID!,
    $userId: UUID!,
    $order: Int
  ) {
    createUserInterface(input: {
      userInterface: {
        interfaceId: $interfaceId,
        userId: $userId,
        order: $order
      }
    }) {
      userInterface {
        order
        interface {
          name
          id
        }
      }
    }
  }
`);
