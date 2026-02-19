export type DeleteUsersInterfaceVariables = {
  userId: string;
  interfaceId: string;
  order: number;
};

export type DeleteUsersInterfaceResponse = {
  deleteUserInterface: {
    user: { id: string };
    userInterface: { interfaceId: string };
  };
};
