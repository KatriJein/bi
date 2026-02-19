export type DeleteUserRoleVariables = {
  userId: string;
  roleId: string;
};

export type DeleteUserRoleResponse = {
  deleteUserRole: {
    user: { id: string };
  };
};
