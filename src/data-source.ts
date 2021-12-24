import {DataObject} from './data-object';
import {QueryBuilder} from './query-builder';
import {DefaultQueryBuilder} from './default-query-builder';
import {Connection} from './connection';

export abstract class DataSource {

    private queryBuilder: QueryBuilder;

    constructor(queryBuilder?: QueryBuilder) {
        this.queryBuilder = queryBuilder ?? (new DefaultQueryBuilder());
    }

    public getTable(tableName: string): DataObject {
        return new DataObject(this, this.queryBuilder, tableName);
    }

    public abstract getConnection(): Promise<Connection>;

    public abstract close(): Promise<void>;
}
