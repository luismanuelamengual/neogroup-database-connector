require('./data-object');
require('./query-builder');
require('./default-query-builder');
require('./connection');

abstract class DataSource {

    private queryBuilder: QueryBuilder;

    constructor(queryBuilder?: QueryBuilder) {
        this.queryBuilder = queryBuilder ?? (new DefaultQueryBuilder());
    }

    public getTable(tableName: string): DataObject {
        return new DataObject(this.getConnection(), this.queryBuilder, tableName);
    }

    public abstract getConnection(): Connection;
}
