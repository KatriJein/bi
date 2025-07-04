import { Interface } from './getUserInterfaces.type';

export type CreateUserInterfaceType = {
  createUserInterface: {
    userInterface: {
      order: number;
      interface: Interface;
    };
  };
};
