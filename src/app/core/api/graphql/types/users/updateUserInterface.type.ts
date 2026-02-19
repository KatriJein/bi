export type UpdateUserInterfaceVariables = {
  interfaceId: string;
  order: number;
  order1?: number | null;
  interfaceId1?: string | null;
  userId: string;
};

export type UpdateUserInterfaceResponse = {
  updateUserInterface: UpdateUserInterfacePayload;
};

export type UpdateUserInterfacePayload = {
  user: {
    id: string;
    name: string;
  };
  userInterface: {
    interfaceId: string;
    order: number;
  };
};
