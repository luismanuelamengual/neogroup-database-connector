import { Connection } from './connection';
import { DataConnection } from './data-connection';
import { DataTable } from './data-table';
import { DefaultQueryBuilder, QueryBuilder } from './query';

export abstract class DataSource {

  protected debug = false;
  protected readonly = false;
  protected queryBuilder: QueryBuilder;

  constructor(queryBuilder?: QueryBuilder) {
    this.queryBuilder = queryBuilder ?? (new DefaultQueryBuilder());
  }

  public setDebugEnabled(debug: boolean) {
    this.debug = debug;
  }

  public isDebugEnabled(): boolean {
    return this.debug;
  }

  public setReadonly(readonly: boolean) {
    this.readonly = readonly;
  }

  public isReadonly(): boolean {
    return this.readonly;
  }

  public table(tableName: string): DataTable {
    return new DataTable(this, tableName);
  }

  public async getConnection(): Promise<DataConnection> {
    const connection = new DataConnection(await this.requestConnection(), this.queryBuilder);
    connection.setDebugEnabled(this.debug);
    connection.setReadonly(this.readonly);
    return connection;
  }

  protected abstract requestConnection(): Promise<Connection>;
  public abstract close(): Promise<void>;
}
