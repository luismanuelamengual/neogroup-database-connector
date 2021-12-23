require('./data-object');
require('./statement');

abstract class QueryBuilder {
    public abstract getSelectQuery(dataObject: DataObject): Statement;
}
