export type GetUsersType = {
  users: {
    nodes: {
      id: string;
      name: string;
      password: string;
      userRoles: {
        nodes: { roleId: string }[];
      };
      userInterfaces: {
        nodes: {
          interface: {
            id: string;
            name: string;
          };
          order: number;
        }[];
      };
    }[];
  };
};
