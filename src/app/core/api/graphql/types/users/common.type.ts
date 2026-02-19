export type User = {
  id: string;
  name: string;
  password?: string | null;
};

export type UserRoleNode = {
  userId: string;
};

export type UserInterfaceNode = {
  interfaceId: string;
};
