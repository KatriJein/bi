import { InterfaceDto } from '../store/interfaces';

export class Interface {
  id: string | undefined;
  name: string | undefined;
  order: number | undefined;

  constructor(data: Partial<Interface>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.order = data.order || 0;
  }

  toDto(): InterfaceDto {
    return { id: this.id, name: this.name, order: this.order };
  }

  static fromDto(dto: InterfaceDto): Interface {
    return new Interface(dto);
  }
}
