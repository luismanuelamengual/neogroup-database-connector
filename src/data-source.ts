import {Query} from './query/query';
import {QueryBuilder} from './query/query-builder';
import {DefaultQueryBuilder} from './query/default-query-builder';
import {Connection} from './connection';

export abstract class DataSource {

    protected queryBuilder: QueryBuilder;

    constructor(queryBuilder?: QueryBuilder) {
        this.queryBuilder = queryBuilder ?? (new DefaultQueryBuilder());
    }

    public getTable(tableName: string): Query {
        return new Query(tableName, this, this.queryBuilder);
    }

    public abstract getConnection(): Promise<Connection>;

    public abstract close(): Promise<void>;
}
