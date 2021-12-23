require('./data-object');
require('./statement');

abstract class QueryBuilder {
    public abstract getSelectStatement(dataObject: DataObject): Statement;
}
