import { DataSet } from '../../database/DataSet'

export abstract class HasFieldValues<R> {
  protected _fields?: DataSet

  public setFields(fields: DataSet | undefined): R {
    this._fields = fields

    return this as unknown as R
  }

  public getFields(): DataSet | undefined {
    return this._fields
  }

  public setFieldValue(field: string, value: any): R {
    if (!this._fields) {
      this._fields = {}
    }

    this._fields[field] = value

    return this as unknown as R
  }

  public getFieldValue(field: string): any {
    return this._fields && this._fields[field]
  }

  public hasFieldValue(field: string): boolean {
    return this._fields && field in this._fields ? true : false
  }
}
