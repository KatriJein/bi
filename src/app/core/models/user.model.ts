import { Role } from './role.model';

export class User {
  id: string | undefined = '4838851f-24c4-4f83-836c-2f266ceb6c81';
  name: string | undefined;
  role: Role | undefined;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
