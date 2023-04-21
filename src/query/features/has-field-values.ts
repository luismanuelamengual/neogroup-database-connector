import { DataSet } from '../../data-set';

export abstract class HasFieldValues<R> {

  protected fieldValues: DataSet;

  public setFieldValues(fieldValues: DataSet): R {
    this.fieldValues = fieldValues;
    return this as unknown as R;
  }

  public getFieldValues(): DataSet{
    return this.fieldValues;
  }

  public set(field: string, value: any): R {
    if (!this.fieldValues) {
      this.fieldValues = {};
    }
    this.fieldValues[field] = value;
    return this as unknown as R;
  }

  public get(field: string): any {
    return this.fieldValues && this.fieldValues[field];
  }

  public has(field: string): boolean {
    return this.fieldValues && field in this.fieldValues;
  }
}