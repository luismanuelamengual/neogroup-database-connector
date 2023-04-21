import { Connection } from '../../connection';
import { DataSet } from '../../data-set';

export class PostgresConnection implements Connection {

  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  public async query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>> {
    const response = await this.client.query(sql, bindings);
    return response.rows;
  }

  public async execute(sql: string, bindings?: Array<any>): Promise<number> {
    const response = await this.client.query(sql, bindings);
    return response.rowCount;
  }

  public async beginTransaction(): Promise<void> {
    await this.client.query('BEGIN');
  }

  public async rollbackTransaction(): Promise<void> {
    await this.client.query('ROLLBACK');
  }

  public async commitTransaction(): Promise<void> {
    await this.client.query('COMMIT');
  }

  public async close(): Promise<void> {
    await this.client.release();
  }
}
