import {DataSource} from './data-source';
import {DataSet} from './data-set';
import {Query} from './query/query';
import {QueryBuilder} from './query/query-builder';

export abstract class Connection {

    protected source: DataSource;
    protected queryBuilder: QueryBuilder;

    constructor(source: DataSource, queryBuilder: QueryBuilder) {
        this.source = source;
        this.queryBuilder = queryBuilder;
    }

    public abstract query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>>;

    public abstract execute(sql: string, bindings?: Array<any>): Promise<number>;

    public abstract beginTransaction(): Promise<void>;

    public abstract rollbackTransaction(): Promise<void>;

    public abstract commitTransaction(): Promise<void>;

    public abstract close(): Promise<void>;

    public getTable(tableName: string): Query {
        return new Query(tableName, this.source, this.queryBuilder, this);
    }

    public async executeTransaction(transaction: (connection: Connection) => Promise<void>) {
        await this.beginTransaction();
        try {
            await transaction(this);
            await this.commitTransaction();
        } catch (e) {
            await this.rollbackTransaction();
        }
    }
}
