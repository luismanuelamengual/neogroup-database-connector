import { SelectQuery } from '../SelectQuery'

export abstract class HasUnions<R> {
  protected _unions?: Array<{ query: SelectQuery; all: boolean }>

  public getUnions(): Array<{ query: SelectQuery; all: boolean }> {
    if (!this._unions) {
      this._unions = []
    }

    return this._unions
  }

  public union(query: SelectQuery): R {
    this.getUnions().push({ query, all: false })

    return this as unknown as R
  }

  public unionAll(query: SelectQuery): R {
    this.getUnions().push({ query, all: true })

    return this as unknown as R
  }
}
