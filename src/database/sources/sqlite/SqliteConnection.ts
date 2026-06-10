import { Connection } from '../../Connection'
import { DataSet } from '../../DataSet'

export class SqliteConnection implements Connection {
  private db: any
  private _lastInsertId: number = 0

  constructor(db: any) {
    this.db = db
  }

  public async query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>> {
    const stmt = this.db.prepare(sql)

    return stmt.all(...(bindings ?? []))
  }

  public async execute(sql: string, bindings?: Array<any>): Promise<number> {
    const stmt = this.db.prepare(sql)
    const result = stmt.run(...(bindings ?? []))

    this._lastInsertId = Number(result.lastInsertRowid ?? 0)

    return result.changes ?? 0
  }

  public async lastInsertId(): Promise<number> {
    return this._lastInsertId
  }

  public async beginTransaction(): Promise<void> {
    this.db.prepare('BEGIN').run()
  }

  public async rollbackTransaction(): Promise<void> {
    this.db.prepare('ROLLBACK').run()
  }

  public async commitTransaction(): Promise<void> {
    this.db.prepare('COMMIT').run()
  }

  public async close(): Promise<void> {
    // La instancia db es compartida; el cierre lo maneja SqliteDataSource
  }
}
