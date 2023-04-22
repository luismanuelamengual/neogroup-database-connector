import { DataSet } from '../../data-set';

export abstract class HasFieldValues<R> {

  protected _fields: DataSet;

  public fields(fields: DataSet): R;
  public fields(): DataSet;
  public fields(fields?: DataSet): R | DataSet {
    if (fields != undefined) {
      this._fields = fields;
      return this as unknown as R;
    } else {
      return this._fields;
    }
  }

  public set(field: string, value: any): R {
    if (!this._fields) {
      this._fields = {};
    }
    this._fields[field] = value;
    return this as unknown as R;
  }

  public get(field: string): any {
    return this._fields && this._fields[field];
  }

  public has(field: string): boolean {
    return this._fields && field in this._fields;
  }
}