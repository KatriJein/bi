export type CreateUserInterfaceVariables = {
  userId: string;
  interfaceId: string;
  order?: number | null;
};

export type CreateUserInterfaceResponse = {
  createUserInterface: {
    user: { id: string };
    userInterface: { interfaceId: string };
  };
};
