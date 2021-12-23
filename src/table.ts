require('./data-object');

class Table {
    private name: string;
    private fields: DataObject = {}

    constructor(name: string) {
        this.name = name;
    }

    public setName(name: string): Table {
        this.name = name;
        return this;
    }

    public getName(): string {
        return this.name;
    }

    public setFields(fields: DataObject): Table {
        this.fields = fields;
        return this;
    }

    public getFields(): DataObject{
        return this.fields;
    }

    public set(field: string, value: any): Table {
        this.fields[field] = value;
        return this;
    }

    public get(field: string): any {
        return this.fields[field];
    }

    public has(field: string): boolean {
        return field in this.fields;
    }
}
