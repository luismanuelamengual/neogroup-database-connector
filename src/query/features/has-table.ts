import { Table } from '../table';

export abstract class HasTable<R> {

  protected _table: Table = '';

  public setTable(table: Table): R {
    this._table = table;
    return this as unknown as R;
  }

  public getTable(): Table {
    return this._table;
  }

  public table(table: Table): R {
    return this.setTable(table);
  }
}