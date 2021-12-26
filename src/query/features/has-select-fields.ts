import {SelectField} from '../fields/select-field';

export abstract class HasSelectFields<R> {

    protected selectFields: Array<SelectField> = [];
    
    public select(...fields: Array<SelectField>): R {
        this.selectFields = this.selectFields.concat(fields);
        return this as unknown as R;
    }

    public selectField(name: string, alias?: string): R {
        this.selectFields.push({name, alias});
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