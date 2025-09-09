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
