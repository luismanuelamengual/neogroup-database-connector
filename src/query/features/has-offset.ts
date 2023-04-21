export abstract class HasOffset<R> {

  protected offset: number = -1;

  public setOffset(offset: number): R {
    this.offset = offset;
    return this as unknown as R;
  }

  public getOffset(): number {
    return this.offset;
  }
}