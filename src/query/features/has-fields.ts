import {DataSet} from '../../data-set';

export abstract class HasFields<R> {

    protected fields: DataSet = {};

    public setFields(fields: DataSet): R {
        this.fields = fields;
        return this as unknown as R;
    }

    public getFields(): DataSet{
        return this.fields;
    }

    public set(field: string, value: any): R {
        this.fields[field] = value;
        return this as unknown as R;
    }

    public get(field: string): any {
        return this.fields[field];
    }

    public has(field: string): boolean {
        return field in this.fields;
    }
}