import { Permission } from '../../../../store/user';

export type GetUserType = {
  users: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        userRoles: {
          nodes: Array<{
            role: {
              id: string;
              name: string;
              permissions: Permission[];
            };
          }>;
        };
      };
    }>;
  };
};

// export type GetUserType = {
//   authenticate: {
//     jwtToken: string;
//     query: {
//       users: {
//         nodes: Array<{
//           id: string;
//           name: string;
//         }>;
//       };
//     };
//   };
// };
