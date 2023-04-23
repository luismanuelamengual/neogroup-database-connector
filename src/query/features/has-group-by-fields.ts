export type GroupByField = string | {name: string, table?: string, schema?: string};

export abstract class HasGroupByFields<R> {

  protected _groupByFields: Array<GroupByField>;

  public setGroupByFields(groupByFields: Array<GroupByField>): R {
    this._groupByFields = groupByFields;
    return this as unknown as R;
  }

  public getGroupByFields(): Array<GroupByField> {
    return this._groupByFields;
  }

  public groupBy(...fields: Array<GroupByField>): R {
    if (!this._groupByFields) {
      this._groupByFields = [];
    }
    this._groupByFields.push(...fields);
    return this as unknown as R;
  }
}
