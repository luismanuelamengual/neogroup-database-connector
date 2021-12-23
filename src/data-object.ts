import {QueryBuilder} from '.';
import {DataSet} from './data-set';
import {DataSource} from './data-source';

export class DataObject {
    private source: DataSource;
    private queryBuilder: QueryBuilder;
    private name: string;
    private fields: DataSet = {}

    constructor(source: DataSource, queryBuilder: QueryBuilder, name: string) {
        this.source = source;
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

    public async find(): Promise<Array<DataSet>> {
        const statement = this.queryBuilder.getSelectStatement(this);
        const connection = await this.source.getConnection();
        return connection.query(statement.sql, statement.bindings);
    }
}
