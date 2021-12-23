import {DataSet} from './data-set';
import {Connection} from './connection';
import {QueryBuilder} from './query-builder';

export class DataObject {
    private connection: Connection;
    private queryBuilder: QueryBuilder;
    private name: string;
    private fields: DataSet = {}

    constructor(connection: Connection, queryBuilder: QueryBuilder, name: string) {
        this.connection = connection;
        this.queryBuilder = queryBuilder;
        this.name = name;
    }

    public setName(name: string): DataObject {
        this.name = name;
        return this;
    }

    public getName(): string {
        return this.name;
    }

    public setFields(fields: DataSet): DataObject {
        this.fields = fields;
        return this;
    }

    public getFields(): DataSet{
        return this.fields;
    }

    public set(field: string, value: any): DataObject {
        this.fields[field] = value;
        return this;
    }

    public get(field: string): any {
        return this.fields[field];
    }

    public has(field: string): boolean {
        return field in this.fields;
    }

    public find(): Promise<Array<DataSet>> {
        const statement = this.queryBuilder.getSelectStatement(this)
        return this.connection.query(statement.sql, statement.bindings);
    }
}
