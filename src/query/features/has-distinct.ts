
export abstract class HasDistinct<R> {

  protected _distinct: boolean = false;

  public distinct(): boolean;
  public distinct(distinct: boolean): R;
  public distinct(distinct?: boolean): R | boolean {
    if (distinct != undefined) {
      this._distinct = distinct;
      return this as unknown as R;
    } else {
      return this._distinct;
    }
  }
}
