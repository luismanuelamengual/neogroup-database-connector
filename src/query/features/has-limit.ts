
export abstract class HasLimit<R> {

  protected limit: number = -1;

  public setLimit(limit: number): R {
    this.limit = limit;
    return this as unknown as R;
  }

  public getLimit(): number {
    return this.limit;
  }
}