
import {Statement} from '../../statement';
import {Query} from '../query';
import {QueryBuilder} from './query-builder';
import {SelectField} from '../fields/select-field';
import {SelectQuery} from '../select-query';

export class DefaultQueryBuilder extends QueryBuilder {

    private static readonly SPACE = " ";
    private static readonly COMMA = ",";
    // private static readonly DOUBLE_QUOTES = "\"";
    private static readonly PARENTHESIS_START = "(";
    private static readonly PARENTHESIS_END = ")";
    private static readonly SELECT = "SELECT";
    // private static readonly INSERT = "INSERT";
    // private static readonly UPDATE = "UPDATE";
    // private static readonly DELETE = "DELETE";
    // private static readonly INTO = "INTO";
    // private static readonly SET = "SET";
    // private static readonly VALUES = "VALUES";
    private static readonly DISTINCT = "DISTINCT";
    private static readonly ALL = "*";
    private static readonly AS = "AS";
    private static readonly POINT = ".";
    private static readonly FROM = "FROM";
    // private static readonly AND = "AND";
    // private static readonly OR = "OR";
    // private static readonly NULL = "NULL";
    // private static readonly IS = "IS";
    // private static readonly NOT = "NOT";
    // private static readonly IN = "IN";
    // private static readonly ON = "ON";
    // private static readonly WHERE = "WHERE";
    // private static readonly HAVING = "HAVING";
    // private static readonly GROUP = "GROUP";
    // private static readonly ORDER = "ORDER";
    // private static readonly BY = "BY";
    // private static readonly LIMIT = "LIMIT";
    // private static readonly OFFSET = "OFFSET";
    // private static readonly LIKE = "LIKE";
    // private static readonly LIKE_WILDCARD = "%";
    // private static readonly ASC = "ASC";
    // private static readonly DESC = "DESC";
    // private static readonly JOIN = "JOIN";
    // private static readonly INNER = "INNER";
    // private static readonly OUTER = "OUTER";
    // private static readonly LEFT = "LEFT";
    // private static readonly RIGHT = "RIGHT";
    // private static readonly CROSS = "CROSS";
    // private static readonly OPERATOR_EQUALS = "=";
    // private static readonly OPERATOR_DISTINCT = "!=";
    // private static readonly OPERATOR_GREATER_THAN = ">";
    // private static readonly OPERATOR_GREATER_OR_EQUALS_THAN = ">=";
    // private static readonly OPERATOR_LOWER_THAN = "<";
    // private static readonly OPERATOR_LOWER_OR_EQUALS_THAN = "<=";
    // private static readonly WILDCARD = "?";

    public buildQuery(query: Query): Statement {
        const statement = {sql: '', bindings: []};
        if (query instanceof SelectQuery) {
            this.buildSelectQuery(query, statement);
        }
        return statement;
    }

    protected buildSelectQuery(query: SelectQuery, statement: Statement) {
        statement.sql = DefaultQueryBuilder.SELECT;
        if (query.isDistinct()) {
            statement.sql += DefaultQueryBuilder.SPACE;
            statement.sql += DefaultQueryBuilder.DISTINCT;
        }
        statement.sql += DefaultQueryBuilder.SPACE;
        const selectFields = query.getSelectFields();
        if (selectFields && selectFields.length > 0) {
            let isFirst = true;
            for (const field of selectFields) {
                if (!isFirst) {
                    statement.sql += DefaultQueryBuilder.COMMA;
                    statement.sql += DefaultQueryBuilder.SPACE;
                }
                this.buildSelectField(field, statement);
                isFirst = false;
            }
        } else {
            statement.sql += DefaultQueryBuilder.ALL;
        }
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.FROM;
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += query.getTableName();
    }

    protected buildSelectField(field: SelectField, statement: Statement) {
        if (typeof field === 'string') {
            statement.sql += field;
        } else {
            if (field.function) {
                statement.sql += field.function.toUpperCase();
                statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
            }
            if (field.table) {
                statement.sql += field.table;
                statement.sql += DefaultQueryBuilder.POINT;
            }
            statement.sql += field.name;
            if (field.function) {
                statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
            }
            if (field.alias) {
                statement.sql += DefaultQueryBuilder.SPACE;
                statement.sql += DefaultQueryBuilder.AS;
                statement.sql += DefaultQueryBuilder.SPACE;
                statement.sql += field.alias;
            }
        }
    }
}
