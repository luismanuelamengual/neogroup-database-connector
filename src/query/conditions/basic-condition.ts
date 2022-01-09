import {Condition} from './condition';
import {Field} from '../fields';

export class BasicCondition extends Condition {

    private field: Field;
    private operator: string;
    private value: any;

    constructor(field: Field, operator: string, value?: any) {
        super();
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    public setField(field: Field) {
        this.field = field;
    }

    public getField(): Field {
        return this.field;
    }

    public setOperator(operator: string) {
        this.operator = operator;
    }

    public getOperator(): string {
        return this.operator;
    }

    public setValue(value: any) {
        this.value = value;
    }

    public getValue(): any {
        return this.value;
    }
}
