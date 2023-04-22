export abstract class HasOffset<R> {

  protected _offset: number = -1;

  public setOffset(offset: number): R {
    this._offset = offset;
    return this as unknown as R;
  }

  public getOffset(): number {
    return this._offset;
  }

  public offset(offset): R {
    return this.setOffset(offset);
  }
}