import {QueryBuilder} from './query-builder';
import {DataSet} from '../data-set';
import {DataSource} from '../data-source';
import {Connection} from '../connection';
import {SelectField} from './select-field';

export class Query {
    private source: DataSource;
    private queryBuilder: QueryBuilder;
    private connection: Connection;
    private tableName: string;
    private fields: DataSet = {};
    private distinct: boolean;
    private selectFields: Array<SelectField> = [];

    constructor(name: string, source: DataSource, queryBuilder: QueryBuilder, connection?: Connection) {
        this.source = source;
        this.queryBuilder = queryBuilder;
        this.connection = connection;
        this.tableName = name;
    }

    public setTableName(tableName: string): Query {
        this.tableName = tableName;
        return this;
    }

    public getTableName(): string {
        return this.tableName;
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

    public select(...fields: Array<SelectField>): Query {
        this.selectFields = this.selectFields.concat(fields);
        return this;
    }

    public selectField(name: string, alias?: string): Query {
        this.selectFields.push({name, alias});
        return this;
    }

    public getSelectFields(): Array<SelectField> {
        return this.selectFields;
    }

    public clearSelectFields(): Query {
        this.selectFields = [];
        return this;
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
