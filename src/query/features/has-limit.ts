
export abstract class HasLimit<R> {

  protected _limit: number = -1;

  public setLimit(limit: number): R {
    this._limit = limit;
    return this as unknown as R;
  }

  public getLimit(): number {
    return this._limit;
  }

  public limit(limit: number): R {
    return this.setLimit(limit);
  }
}