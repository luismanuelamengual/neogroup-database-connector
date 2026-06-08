import { DataConnection } from './data-connection'
import { DataSet } from './data-set'
import { DataSource } from './data-source'
import { DataTable } from './data-table'
import { ConditionGroup, DeleteQuery, InsertQuery, Query, SelectQuery, Table, UpdateQuery } from './query'

export abstract class DB {
  private static sources = new Map<string, DataSource>()
  private static activeSourceName?: string

  // ── Registration ────────────────────────────────────────────────────────────

  public static register(source: DataSource): void
  public static register(sourceName: string, source: DataSource): void
  public static register(sourceOrName: DataSource | string, source?: DataSource): void {
    const sourceName = source ? (sourceOrName as string) : 'source' + (this.sources.size + 1)
    const sourceToRegister = source ?? (sourceOrName as DataSource)

    this.sources.set(sourceName, sourceToRegister)

    if (!this.activeSourceName) {
      this.activeSourceName = sourceName
    }
  }

  public static setActiveSource(sourceName: string): void {
    if (!this.sources.has(sourceName)) {
      throw new Error(`No DataSource registered with the name "${sourceName}"`)
    }

    this.activeSourceName = sourceName
  }

  public static source(sourceName: string): DataSource {
    const source = this.sources.get(sourceName)

    if (!source) {
      throw new Error(`No DataSource registered with the name "${sourceName}"`)
    }

    return source
  }

  // ── Query builder helpers ────────────────────────────────────────────────────

  public static table(tableName: string): DataTable {
    return this.activeSource.table(tableName)
  }

  public static conditionGroup(): ConditionGroup {
    return new ConditionGroup()
  }

  public static selectQuery(table?: Table): SelectQuery {
    return new SelectQuery(table)
  }

  public static updateQuery(table?: Table): UpdateQuery {
    return new UpdateQuery(table)
  }

  public static deleteQuery(table?: Table): DeleteQuery {
    return new DeleteQuery(table)
  }

  public static insertQuery(table?: Table): InsertQuery {
    return new InsertQuery(table)
  }

  // ── Connection ──────────────────────────────────────────────────────────────

  public static connection(): Promise<DataConnection> {
    return this.activeSource.getConnection()
  }

  // ── Query / Execute ─────────────────────────────────────────────────────────

  public static query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>>
  public static query(query: Query): Promise<Array<DataSet>>
  public static async query(): Promise<Array<DataSet>> {
    const conn = await this.connection()

    // @ts-ignore
    return conn.query(...arguments)
  }

  public static execute(sql: string, bindings?: Array<any>): Promise<number>
  public static execute(query: Query): Promise<number>
  public static async execute(): Promise<number> {
    const conn = await this.connection()

    // @ts-ignore
    return conn.execute(...arguments)
  }

  // ── Transactions ────────────────────────────────────────────────────────────

  public static async beginTransaction(): Promise<void> {
    return (await this.connection()).beginTransaction()
  }

  public static async commitTransaction(): Promise<void> {
    return (await this.connection()).commitTransaction()
  }

  public static async rollbackTransaction(): Promise<void> {
    return (await this.connection()).rollbackTransaction()
  }

  public static async executeTransaction(callback: (connection: DataConnection) => Promise<void>): Promise<void> {
    return (await this.connection()).executeTransaction(callback)
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private static get activeSource(): DataSource {
    if (this.sources.size === 0) {
      throw new Error('No DataSources registered. Register a DataSource with DB.register() first.')
    }

    return this.sources.get(this.activeSourceName!) as DataSource
  }
}
