export type SelectField = string | {name: string, table?: string, schema?: string, function?: string, alias?: string};

export abstract class HasSelectFields<R> {

  protected _selectFields: Array<SelectField>;

  public setSelectFields(selectFields: Array<SelectField>) {
    this._selectFields = selectFields;
  }

  public getSelectFields(): Array<SelectField> {
    return this._selectFields;
  }

  public select(...fields: Array<SelectField>): R {
    if (!this._selectFields) {
      this._selectFields = [];
    }
    this._selectFields.push(...fields);
    return this as unknown as R;
  }
}
