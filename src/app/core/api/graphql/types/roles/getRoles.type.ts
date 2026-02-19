export type GetRolesType = {
  roles: {
    nodes: Role[];
  }
};

export type Role = {
  id: string;
  name: string;
};
