import { gql } from 'apollo-angular';

export const updateInterfaceOrderMutation = gql(`
mutation UpdateInterfaceOrder($interfaceId: UUID!, $order: Int!, $userId: UUID!, $newOrder: Int) {
  updateUserInterface(
    input: {patch: {order: $newOrder}, userId: $userId, interfaceId: $interfaceId, order: $order}
  ) {
    userInterface {
      order
      interface {
        id
      }
    }
  }
}
`);
