import { Connection } from '../../Connection'
import { DataSet } from '../../DataSet'

export class MysqlConnection implements Connection {
  private connection: any
  private _lastInsertId: number = 0

  constructor(connection: any) {
    this.connection = connection
  }

  public async query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>> {
    const [rows] = await this.connection.execute(sql, bindings ?? [])

    return rows as Array<DataSet>
  }

  public async execute(sql: string, bindings?: Array<any>): Promise<number> {
    const [result] = await this.connection.execute(sql, bindings ?? [])

    this._lastInsertId = (result as any).insertId ?? 0

    return (result as any).affectedRows ?? 0
  }

  public async lastInsertId(): Promise<number> {
    return this._lastInsertId
  }

  public async beginTransaction(): Promise<void> {
    await this.connection.beginTransaction()
  }

  public async rollbackTransaction(): Promise<void> {
    await this.connection.rollback()
  }

  public async commitTransaction(): Promise<void> {
    await this.connection.commit()
  }

  public async close(): Promise<void> {
    this.connection.release()
  }
}
