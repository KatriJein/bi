import { Interface } from './getUserInterfaces.type';

export interface UpdateInterfaceMutationVariables {
  id: string;
  name: string;
}

export interface UpdateInterfaceMutationResponse {
  updateInterface: {
    interface: {
      id: string;
      name: string;
      userInterfaces: {
        nodes: [
          {
            order: number;
          }
        ];
      };
    };
  };
}
