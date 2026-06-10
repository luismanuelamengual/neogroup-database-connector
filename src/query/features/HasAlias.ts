export abstract class HasAlias<R> {
  protected _alias?: string

  public setAlias(alias: string | undefined): R {
    this._alias = alias

    return this as unknown as R
  }

  public getAlias(): string | undefined {
    return this._alias
  }

  public alias(alias: string): R {
    return this.setAlias(alias)
  }
}
