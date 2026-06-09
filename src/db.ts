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
    this._ensureConfigured()

    const source = this.sources.get(sourceName)

    if (!source) {
      throw new Error(`No DataSource registered with the name "${sourceName}"`)
    }

    return source
  }

  // ── Environment-variable configuration ──────────────────────────────────────

  /**
   * Reads environment variables and registers the corresponding data sources.
   * Called automatically the first time a source is needed if none have been
   * registered manually.
   *
   * Supported variables:
   *
   *   Default source:
   *     DB_DRIVER     sqlite | postgres | mysql   (required)
   *     DB_FILE       path to SQLite file          (sqlite only, default: :memory:)
   *     DB_HOST       database host                (postgres / mysql)
   *     DB_PORT       database port                (postgres / mysql)
   *     DB_NAME       database name                (postgres / mysql)
   *     DB_USERNAME   login username               (postgres / mysql)
   *     DB_PASSWORD   login password               (postgres / mysql)
   *
   *   Named source  (replace <NAME> with the desired source name in upper-case):
   *     DB_<NAME>_DRIVER, DB_<NAME>_HOST, DB_<NAME>_PORT, DB_<NAME>_NAME,
   *     DB_<NAME>_USERNAME, DB_<NAME>_PASSWORD, DB_<NAME>_FILE
   *
   * Example:
   *   DB_DRIVER=postgres DB_HOST=localhost DB_NAME=app DB_USERNAME=user DB_PASSWORD=pass
   *   DB_REPORTING_DRIVER=sqlite DB_REPORTING_FILE=./reporting.db
   */
  public static configure(): void {
    if (this.sources.size > 0) {
      return // already configured — manual register() takes precedence
    }

    const env = process.env
    // 1. Default (unnamed) source — registered first so it becomes active
    const defaultDriver = env['DB_DRIVER']

    if (defaultDriver) {
      const get = (key: string) => env[`DB_${key}`]

      this.register(this._buildSourceFromEnv(defaultDriver, get))
    }

    // 2. Named sources — DB_<NAME>_DRIVER pattern
    for (const key of Object.keys(env).sort()) {
      const match = key.match(/^DB_([A-Z][A-Z0-9_]*)_DRIVER$/)

      if (!match) {
        continue
      }

      const name = match[1].toLowerCase()
      const prefix = `DB_${match[1]}_`
      const get = (k: string) => env[prefix + k]

      this.register(name, this._buildSourceFromEnv(env[key]!, get))
    }

    if (this.sources.size === 0) {
      throw new Error(
        'No data source configured. ' +
          'Call DB.register() or set the DB_DRIVER environment variable ' +
          '(e.g. DB_DRIVER=sqlite, DB_DRIVER=postgres, DB_DRIVER=mysql).'
      )
    }
  }

  private static _buildSourceFromEnv(driver: string, get: (key: string) => string | undefined): DataSource {
    switch (driver.toLowerCase()) {
      case 'sqlite': {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { SqliteDataSource } = require('./sources/sqlite')
        const s = new SqliteDataSource()
        const file = get('FILE')

        if (file) {
          s.setFilename(file)
        }

        return s
      }

      case 'postgres':

      case 'postgresql': {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PostgresDataSource } = require('./sources/postgres')
        const s = new PostgresDataSource()
        const host = get('HOST')
        const port = get('PORT')
        const name = get('NAME') ?? get('DATABASE')
        const username = get('USERNAME') ?? get('USER')
        const password = get('PASSWORD') ?? get('PASS')

        if (host) {
          s.setHost(host)
        }

        if (port) {
          s.setPort(Number(port))
        }

        if (name) {
          s.setDatabaseName(name)
        }

        if (username) {
          s.setUsername(username)
        }

        if (password) {
          s.setPassword(password)
        }

        return s
      }

      case 'mysql': {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { MysqlDataSource } = require('./sources/mysql')
        const s = new MysqlDataSource()
        const host = get('HOST')
        const port = get('PORT')
        const name = get('NAME') ?? get('DATABASE')
        const username = get('USERNAME') ?? get('USER')
        const password = get('PASSWORD') ?? get('PASS')

        if (host) {
          s.setHost(host)
        }

        if (port) {
          s.setPort(Number(port))
        }

        if (name) {
          s.setDatabaseName(name)
        }

        if (username) {
          s.setUsername(username)
        }

        if (password) {
          s.setPassword(password)
        }

        return s
      }

      default:
        throw new Error(`Unknown DB driver "${driver}". Supported drivers: sqlite, postgres, mysql.`)
    }
  }

  private static _ensureConfigured(): void {
    if (this.sources.size === 0) {
      this.configure()
    }
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

  public static getActiveSource(): DataSource {
    return this.activeSource
  }

  private static get activeSource(): DataSource {
    this._ensureConfigured()

    return this.sources.get(this.activeSourceName!) as DataSource
  }
}
