export type DeleteUserInterfaceResponse = {
  deleteUserInterface: {
    interface: {
      id: string;
    };
  };
}

export type DeleteUserInterfaceVariables = {
  userId: string;
  interfaceId: string;
  order: number;
}
