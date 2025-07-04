export class Connection {
  id: string | undefined;
  name: string | undefined;
  type: string | undefined;
  config:
    | {
        host: string;
        port: number;
        database: string;
        username?: string;
        password?: string;
      }
    | undefined;

  constructor(data: Partial<Connection>) {
    Object.assign(this, data);
  }

  getConnectionString(): string {
    if (!this.config) return '';
    if (this.type === 'graphql') {
      return `http://${this.config.host}:${this.config.port}/${this.config.database}`;
    }

    return `${this.type}://${this.config.host}:${this.config.port}/${this.config.database}`;
  }
}

