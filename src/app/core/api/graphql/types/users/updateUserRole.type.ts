export type UpdateUserRoleVariables = {
  userId: string;
  roleId: string;
  roleId1: string;
};

export type UpdateUserRoleResponse = {
  updateUserRole: UpdateUserRolePayload;
};

export type UpdateUserRolePayload = {
  user: {
    id: string;
  };
  userRole: {
    roleId: string;
  };
};
