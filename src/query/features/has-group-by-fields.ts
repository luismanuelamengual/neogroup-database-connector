import { Field } from '../fields';

export abstract class HasGroupByFields<R> {

  protected _groupByFields: Array<Field>;

  public setGroupByFields(groupByFields: Array<Field>): R {
    this._groupByFields = groupByFields;
    return this as unknown as R;
  }

  public getGroupByFields(): Array<Field> {
    return this._groupByFields;
  }

  public groupBy(...fields: Array<Field>): R {
    if (!this._groupByFields) {
      this._groupByFields = [];
    }
    this._groupByFields.push(...fields);
    return this as unknown as R;
  }
}
