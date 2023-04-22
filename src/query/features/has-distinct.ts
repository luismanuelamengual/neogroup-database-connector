
export abstract class HasDistinct<R> {

  protected _distinct: boolean = false;

  public setDistinct(distinct: boolean): R {
    this._distinct = distinct;
    return this as unknown as R;
  }

  public isDistinct(): boolean {
    return this._distinct;
  }

  public distinct(distinct: boolean): R {
    return this.setDistinct(distinct);
  }
}
