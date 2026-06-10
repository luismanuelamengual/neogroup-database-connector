import { Connection } from '../../connection'
import { DataSource } from '../../data-source'
import { SqliteConnection } from './sqlite-connection'
import { SqliteQueryBuilder } from './sqlite-query-builder'

export class SqliteDataSource extends DataSource {
  private db: any
  private filename: string

  constructor() {
    super(new SqliteQueryBuilder())
    this.filename = ':memory:'
  }

  public setFilename(filename: string) {
    this.filename = filename
  }

  public getFilename(): string {
    return this.filename
  }

  public async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  protected async requestConnection(): Promise<Connection> {
    if (!this.db) {
      // node:sqlite viene incorporado en Node.js >= 22.5 — sin dependencias externas
      const { DatabaseSync } = require('node:sqlite')

      this.db = new DatabaseSync(this.filename)
    }

    return new SqliteConnection(this.db)
  }
}
