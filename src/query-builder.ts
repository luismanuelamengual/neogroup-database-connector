require('./data-object');

abstract class QueryBuilder {
    public abstract buildSelectQuery(dataObject: DataObject): string;
}
