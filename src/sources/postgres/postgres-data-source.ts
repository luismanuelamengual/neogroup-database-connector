import { Connection } from '../../connection';
import { DataSource } from '../../data-source';
import { PostgresConnection } from './postgres-connection';
import { PostgresQueryBuilder } from './postgres-query-builder';

export class PostgresDataSource extends DataSource {

  private lib: any;
  private pool: any;
  private host: string;
  private port: number;
  private databaseName: string;
  private username: string;
  private password: string;

  constructor() {
    super(new PostgresQueryBuilder());
    try {
      this.lib = require('pg');
    } catch (e) {
      throw new Error('PostgreSQL module not found. Please install it via "npm install -S pg"');
    }
    this.port = 5432;
  }

  public setHost(host: string) {
    this.host = host;
  }

  public getHost(): string {
    return this.host;
  }

  public setPort(port: number) {
    this.port = port;
  }

  public getPort(): number {
    return this.port;
  }

  public setDatabaseName(databaseName: string) {
    this.databaseName = databaseName;
  }

  public getDatabaseName(): string {
    return this.databaseName;
  }

  public setUsername(username: string) {
    this.username = username;
  }

  public getUsername(): string {
    return this.username;
  }

  public setPassword(password: string) {
    this.password = password;
  }

  public getPassword(): string {
    return this.password;
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  protected async requestConnection(): Promise<Connection> {
    if (!this.pool) {
      const config: any = {
        host: this.getHost(),
        port: this.getPort(),
        database: this.getDatabaseName(),
        user: this.getUsername(),
        password: this.getPassword()
      };
      this.pool = new this.lib.Pool(config);
    }
    return new PostgresConnection(await this.pool.connect());
  }
}
