import { SelectField } from '../fields/select-field';

export abstract class HasSelectFields<R> {

  protected _selectFields: Array<SelectField>;

  public setSelectFields(selectFields: Array<SelectField>) {
    this._selectFields = selectFields;
  }

  public getSelectFields(): Array<SelectField> {
    return this._selectFields;
  }

  public select(...fields: Array<SelectField | string | {name: string, table?: string, functionName?: string, alias?: string}>): R {
    if (!this._selectFields) {
      this._selectFields = [];
    }
    for (const field of fields) {
      let selectField: SelectField;
      if (field instanceof SelectField) {
        selectField = field;
      } else if (typeof field === 'string') {
        selectField = new SelectField(field);
      } else {
        selectField = new SelectField(field.name);
        if (field.table) {
          selectField.setTable(field.table);
        }
        if (field.functionName) {
          selectField.setFunctionName(field.functionName);
        }
        if (field.alias) {
          selectField.setAlias(field.alias);
        }
      }
      this._selectFields.push(selectField);
    }
    return this as unknown as R;
  }
}
