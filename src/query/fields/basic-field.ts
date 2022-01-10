import {Field} from './field';

export class BasicField extends Field {
    private name: string;
    private table: string;

    constructor(value: string)
    constructor(name: string, table: string)
    constructor() {
        super();
        if (arguments.length == 1) {
            const value = arguments[0];
            const valueParts = value.split('\.');
            if (valueParts.length > 1) {
                this.table = valueParts[0];
                this.name = valueParts[1];    
            } else {
                this.name = valueParts[0];
            }
        } else {
            this.name = arguments[0];
            this.table = arguments[1];
        }
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setTable(table: string) {
        this.table = table;
    }

    public getTable(): string {
        return this.table;
    }
}
