export type UpdateInterfaceOrderMutationVariables = {
  interfaceId: string;
  order: number;
  userId: string;
  newOrder: number;
};

export type UpdateInterfaceOrderMutationResponse = {
  updateUserInterface: {
    userInterface: {
      order: number;
      interface: {
        id: string;
      };
    };
  };
};
