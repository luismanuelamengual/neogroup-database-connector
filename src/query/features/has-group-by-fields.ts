import { BasicField } from '../fields';

export abstract class HasGroupByFields<R> {

  protected _groupByFields: Array<BasicField>;

  public setGroupByFields(groupByFields: Array<BasicField>): R {
    this._groupByFields = groupByFields;
    return this as unknown as R;
  }

  public getGroupByFields(): Array<BasicField> {
    return this._groupByFields;
  }

  public groupBy(...fields: Array<BasicField | string>): R {
    if (!this._groupByFields) {
      this._groupByFields = [];
    }
    for (const field of fields) {
      let groupByField: BasicField;
      if (field instanceof BasicField) {
        groupByField = field;
      } else if (typeof field === 'string') {
        groupByField = new BasicField(field);
      }
      this._groupByFields.push(groupByField);
    }
    return this as unknown as R;
  }
}
