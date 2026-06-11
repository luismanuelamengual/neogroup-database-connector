import { QueryTable } from '../QueryTable'

export abstract class HasTable<R> {
  protected _table: QueryTable = ''

  public setTable(table: QueryTable): R {
    this._table = table

    return this as unknown as R
  }

  public getTable(): QueryTable {
    return this._table
  }

  public table(table: QueryTable): R {
    return this.setTable(table)
  }
}
