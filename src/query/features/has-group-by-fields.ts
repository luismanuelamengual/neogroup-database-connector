import { BasicField } from '../fields';

export abstract class HasGroupByFields<R> {

  protected _groupByFields: Array<BasicField>;

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

  public groupByFields(groupByFields: Array<BasicField>): R;
  public groupByFields(): Array<BasicField>;
  public groupByFields(groupByFields?: Array<BasicField>): R | Array<BasicField> {
    if (groupByFields != undefined) {
      this._groupByFields = groupByFields;
      return this as unknown as R;
    } else {
      return this._groupByFields;
    }
  }
}
