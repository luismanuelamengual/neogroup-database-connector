require('./data-object');
require('./query-builder');
require('./connection-pool');

abstract class DataSource {

    private connectionPool: ConnectionPool;
    private queryBuilder: QueryBuilder;

    constructor(connectionPool?: ConnectionPool, queryBuilder?: QueryBuilder) {
        this.connectionPool = connectionPool;
        this.queryBuilder = queryBuilder;
    }

    public getConnectionPool(): ConnectionPool {
        return this.connectionPool;
    }

    public setConnectionPool(connectionPool: ConnectionPool) {
        this.connectionPool = connectionPool;
    }

    public getQueryBuilder(): QueryBuilder {
        return this.queryBuilder;
    }

    public setQueryBuilder(queryBuilder: QueryBuilder) {
        this.queryBuilder = queryBuilder;
    }

    public getTable(tableName: string): DataObject {
        return new DataObject(this.connectionPool.getConnection(), this.queryBuilder, tableName);
    }
}
