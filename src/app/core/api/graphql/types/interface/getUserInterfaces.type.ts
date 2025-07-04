export type GetUserInterfacesType = {
  user?: {
    userInterfaces: {
      nodes: Array<{
        order: number;
        interface?: Interface | null;
      }>;
    };
  } | null;
};

export type Interface = {
  id: string;
  name: string;
};
