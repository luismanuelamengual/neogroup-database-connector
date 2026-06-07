import { Connection } from '../../connection'
import { DataSource } from '../../data-source'
import { MysqlConnection } from './mysql-connection'
import { MysqlQueryBuilder } from './mysql-query-builder'

export class MysqlDataSource extends DataSource {
  private lib: any
  private pool: any
  private host: string
  private port: number
  private databaseName: string
  private username: string
  private password: string

  constructor() {
    super(new MysqlQueryBuilder())

    try {
      this.lib = require('mysql2/promise')
    } catch (e) {
      throw new Error('MySQL module not found. Please install it via "npm install -S mysql2"')
    }

    this.host = ''
    this.port = 3306
    this.databaseName = ''
    this.username = ''
    this.password = ''
  }

  public setHost(host: string) {
    this.host = host
  }

  public getHost(): string {
    return this.host
  }

  public setPort(port: number) {
    this.port = port
  }

  public getPort(): number {
    return this.port
  }

  public setDatabaseName(databaseName: string) {
    this.databaseName = databaseName
  }

  public getDatabaseName(): string {
    return this.databaseName
  }

  public setUsername(username: string) {
    this.username = username
  }

  public getUsername(): string {
    return this.username
  }

  public setPassword(password: string) {
    this.password = password
  }

  public getPassword(): string {
    return this.password
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }

  protected async requestConnection(): Promise<Connection> {
    if (!this.pool) {
      this.pool = this.lib.createPool({
        host: this.getHost(),
        port: this.getPort(),
        database: this.getDatabaseName(),
        user: this.getUsername(),
        password: this.getPassword()
      })
    }

    return new MysqlConnection(await this.pool.getConnection())
  }
}
