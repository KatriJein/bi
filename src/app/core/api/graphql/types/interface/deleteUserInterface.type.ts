export type DeleteUserInterfaceResponse = {
  deleteUserInterface: {
    interface: {
      id: string;
    };
    user: {
      id: string;
    }
  };
}

export type DeleteUserInterfaceVariables = {
  userId: string;
  interfaceId: string;
  order: number;
}
