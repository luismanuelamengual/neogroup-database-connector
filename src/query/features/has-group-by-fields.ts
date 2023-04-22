import { BasicField } from '../fields';

export abstract class HasGroupByFields<R> {

  protected groupByFields: Array<BasicField>;

  public groupBy(...fields: Array<BasicField | string>): R {
    if (!this.groupByFields) {
      this.groupByFields = [];
    }
    for (const field of fields) {
      let groupByField: BasicField;
      if (field instanceof BasicField) {
        groupByField = field;
      } else if (typeof field === 'string') {
        groupByField = new BasicField(field);
      }
      this.groupByFields.push(groupByField);
    }
    return this as unknown as R;
  }

  public setGroupByFields(selectFields: Array<BasicField>) {
    this.groupByFields = selectFields;
  }

  public getGroupByFields(): Array<BasicField> {
    return this.groupByFields;
  }

  public clearGroupByFields(): R {
    this.groupByFields = [];
    return this as unknown as R;
  }
}
