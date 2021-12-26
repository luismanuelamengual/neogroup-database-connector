import {QueryBuilder} from './query-builder';
import {DataSet} from '../data-set';
import {DataSource} from '../data-source';
import {Connection} from '../connection';

export class Query {
    private source: DataSource;
    private queryBuilder: QueryBuilder;
    private connection: Connection;
    private name: string;
    private fields: DataSet = {};
    private distinct: boolean;

    constructor(name: string, source: DataSource, queryBuilder: QueryBuilder, connection?: Connection) {
        this.source = source;
        this.queryBuilder = queryBuilder;
        this.connection = connection;
        this.name = name;
    }

    public setName(name: string): Query {
        this.name = name;
        return this;
    }

    public getName(): string {
        return this.name;
    }

    public setFields(fields: DataSet): Query {
        this.fields = fields;
        return this;
    }

    public getFields(): DataSet{
        return this.fields;
    }

    public set(field: string, value: any): Query {
        this.fields[field] = value;
        return this;
    }

    public get(field: string): any {
        return this.fields[field];
    }

    public has(field: string): boolean {
        return field in this.fields;
    }

    public setDistinct(distinct: boolean): Query {
        this.distinct = distinct;
        return this;
    }

    public isDistinct(): boolean {
        return this.distinct;
    }

    public async find(): Promise<Array<DataSet>> {
        const statement = this.queryBuilder.getSelectStatement(this);
        let resultSet: Array<DataSet>;
        if (this.connection) {
            resultSet = await this.connection.query(statement.sql, statement.bindings);
        } else {
            const connection = await this.source.getConnection();
            resultSet = await connection.query(statement.sql, statement.bindings); 
            await connection.close();
        }
        return resultSet;
    }
}
