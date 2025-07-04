export type GetUserType = {
  users: {
    edges: Array<{
      node: {
        id: string;
        name: string;
      };
    }>;
  };
};
