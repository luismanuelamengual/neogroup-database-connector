import { SelectField } from '../fields/select-field';

export abstract class HasSelectFields<R> {

  protected selectFields: Array<SelectField>;

  public select(...fields: Array<SelectField | string | {name: string, table?: string, functionName?: string, alias?: string}>): R {
    if (!this.selectFields) {
      this.selectFields = [];
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
      this.selectFields.push(selectField);
    }
    return this as unknown as R;
  }

  public setSelectFields(selectFields: Array<SelectField>) {
    this.selectFields = selectFields;
  }

  public getSelectFields(): Array<SelectField> {
    return this.selectFields;
  }

  public clearSelectFields(): R {
    this.selectFields = [];
    return this as unknown as R;
  }
}
