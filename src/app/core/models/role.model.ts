export class Role {
  id: string | undefined;
  name: string | undefined;

  constructor(data: Partial<Role>) {
    Object.assign(this, data);
  }

}
