
export abstract class HasTable<R> {

  protected _table: string = '';

  public setTable(table: string): R {
    this._table = table;
    return this as unknown as R;
  }

  public getTable(): string {
    return this._table;
  }

  public table(table: string): R {
    return this.setTable(table);
  }
}