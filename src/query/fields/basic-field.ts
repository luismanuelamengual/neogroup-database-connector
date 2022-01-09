import {Field} from './field';

export class BasicField extends Field {
    private name: string;
    private table: string;

    constructor(name: string, table?: string) {
        super();
        this.name = name;
        this.table = table;
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
