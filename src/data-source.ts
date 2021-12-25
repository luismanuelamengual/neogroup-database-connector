import {DataObject} from './data-object';
import {QueryBuilder} from './query-builder';
import {DefaultQueryBuilder} from './default-query-builder';
import {Connection} from './connection';

export abstract class DataSource {

    protected queryBuilder: QueryBuilder;

    constructor(queryBuilder?: QueryBuilder) {
        this.queryBuilder = queryBuilder ?? (new DefaultQueryBuilder());
    }

    public getTable(tableName: string): DataObject {
        return new DataObject(tableName, this, this.queryBuilder);
    }

    public abstract getConnection(): Promise<Connection>;

    public abstract close(): Promise<void>;
}
