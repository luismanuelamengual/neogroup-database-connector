import { BasicField, RawField } from '../fields';

export type SelectField = RawField | BasicField & {function?: string, alias?: string};

export abstract class HasSelectFields<R> {

  protected _selectFields: Array<SelectField>;

  public setSelectFields(selectFields: Array<SelectField>): R {
    this._selectFields = selectFields;
    return this as unknown as R;
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
