require('./data-object');
require('./statement');

class DefaultQueryBuilder extends QueryBuilder {
    
    private static readonly SPACE = " ";
    private static readonly COMMA = ",";
    private static readonly DOUBLE_QUOTES = "\"";
    private static readonly PARENTHESIS_START = "(";
    private static readonly PARENTHESIS_END = ")";
    private static readonly SELECT = "SELECT";
    private static readonly INSERT = "INSERT";
    private static readonly UPDATE = "UPDATE";
    private static readonly DELETE = "DELETE";
    private static readonly INTO = "INTO";
    private static readonly SET = "SET";
    private static readonly VALUES = "VALUES";
    private static readonly DISTINCT = "DISTINCT";
    private static readonly ALL = "*";
    private static readonly AS = "AS";
    private static readonly POINT = ".";
    private static readonly FROM = "FROM";
    private static readonly AND = "AND";
    private static readonly OR = "OR";
    private static readonly NULL = "NULL";
    private static readonly IS = "IS";
    private static readonly NOT = "NOT";
    private static readonly IN = "IN";
    private static readonly ON = "ON";
    private static readonly WHERE = "WHERE";
    private static readonly HAVING = "HAVING";
    private static readonly GROUP = "GROUP";
    private static readonly ORDER = "ORDER";
    private static readonly BY = "BY";
    private static readonly LIMIT = "LIMIT";
    private static readonly OFFSET = "OFFSET";
    private static readonly LIKE = "LIKE";
    private static readonly LIKE_WILDCARD = "%";
    private static readonly ASC = "ASC";
    private static readonly DESC = "DESC";
    private static readonly JOIN = "JOIN";
    private static readonly INNER = "INNER";
    private static readonly OUTER = "OUTER";
    private static readonly LEFT = "LEFT";
    private static readonly RIGHT = "RIGHT";
    private static readonly CROSS = "CROSS";
    private static readonly OPERATOR_EQUALS = "=";
    private static readonly OPERATOR_DISTINCT = "!=";
    private static readonly OPERATOR_GREATER_THAN = ">";
    private static readonly OPERATOR_GREATER_OR_EQUALS_THAN = ">=";
    private static readonly OPERATOR_LOWER_THAN = "<";
    private static readonly OPERATOR_LOWER_OR_EQUALS_THAN = "<=";
    private static readonly WILDCARD = "?";

    public getSelectQuery(dataObject: DataObject): Statement {
        const statement = {sql: '', bindings: []};
        this.buildSelectQuery(dataObject, statement);
        return statement;
    }

    private buildSelectQuery(dataObject: DataObject, statement: Statement) {
        statement.sql = DefaultQueryBuilder.SELECT;
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.ALL;
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.FROM;
        statement.sql += dataObject.getName();
    }
}