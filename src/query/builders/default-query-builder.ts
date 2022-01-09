import {Statement} from '../statement';
import {Query} from '../query';
import {QueryBuilder} from './query-builder';
import {SelectQuery} from '../select-query';
import {InsertQuery} from '../insert-query';
import {ConditionConnector, ConditionGroup, Condition, RawCondition, BasicCondition} from '../conditions';
import {Field, SelectField} from '../fields';

export class DefaultQueryBuilder extends QueryBuilder {

    private static readonly SPACE = " ";
    private static readonly COMMA = ",";
    // private static readonly DOUBLE_QUOTES = "\"";
    private static readonly PARENTHESIS_START = "(";
    private static readonly PARENTHESIS_END = ")";
    private static readonly SELECT = "SELECT";
    private static readonly INSERT = "INSERT";
    // private static readonly UPDATE = "UPDATE";
    // private static readonly DELETE = "DELETE";
    private static readonly INTO = "INTO";
    // private static readonly SET = "SET";
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
    // private static readonly ON = "ON";
    private static readonly WHERE = "WHERE";
    // private static readonly HAVING = "HAVING";
    // private static readonly GROUP = "GROUP";
    // private static readonly ORDER = "ORDER";
    // private static readonly BY = "BY";
    // private static readonly LIMIT = "LIMIT";
    // private static readonly OFFSET = "OFFSET";
    // private static readonly ASC = "ASC";
    // private static readonly DESC = "DESC";
    // private static readonly JOIN = "JOIN";
    // private static readonly INNER = "INNER";
    // private static readonly OUTER = "OUTER";
    // private static readonly LEFT = "LEFT";
    // private static readonly RIGHT = "RIGHT";
    // private static readonly CROSS = "CROSS";
    private static readonly WILDCARD = "?";

    public buildQuery(query: Query): Statement {
        const statement = {sql: '', bindings: []};
        if (query instanceof SelectQuery) {
            this.buildSelectQuery(query, statement);
        } else if (query instanceof InsertQuery) {
            this.buildInsertQuery(query, statement);
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
        this.buildTableName(query.getTableName(), statement);
        
        const tableAlias = query.getTableAlias();
        if (tableAlias != null) {
            statement.sql += DefaultQueryBuilder.SPACE;
            statement.sql += DefaultQueryBuilder.AS;
            statement.sql += DefaultQueryBuilder.SPACE;
            statement.sql += tableAlias;
        }

        const whereConditions = query.getWhereConditions();
        if (whereConditions) {
            statement.sql += DefaultQueryBuilder.SPACE;
            statement.sql += DefaultQueryBuilder.WHERE;
            statement.sql += DefaultQueryBuilder.SPACE;
            this.buildConditionGroup(whereConditions, statement);
        }
    }

    protected buildInsertQuery(query: InsertQuery, statement: Statement) {
        statement.sql += DefaultQueryBuilder.INSERT;
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.INTO;
        statement.sql += DefaultQueryBuilder.SPACE;
        this.buildTableName(query.getTableName(), statement);
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
        const fields = query.getFields();
        let isFirst = true;
        for (const fieldName in fields) {
            if (!isFirst) {
                statement.sql += DefaultQueryBuilder.COMMA;
                statement.sql += DefaultQueryBuilder.SPACE;
            }
            statement.sql += fieldName;
            isFirst = false;
        }
        statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.VALUES;
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
        isFirst = true;
        for (const field in fields) {
            const fieldValue = fields[field];
            if (!isFirst) {
                statement.sql += DefaultQueryBuilder.COMMA;
                statement.sql += DefaultQueryBuilder.SPACE;
            }
            this.buildValue(fieldValue, statement);
            isFirst = false;
        }
        statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
    }

    protected buildField(field: Field, statement: Statement) {
        if (typeof field === 'string') {
            statement.sql += field;
        } else {
            if (field.function) {
                statement.sql += field.function.toUpperCase();
                statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
            }
            if (field.table) {
                this.buildTableName(field.table, statement);
                statement.sql += DefaultQueryBuilder.POINT;
            }
            statement.sql += field.name;
            if (field.function) {
                statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
            }
        }
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
                this.buildTableName(field.table, statement);
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

    protected buildCondition(condition: Condition, statement: Statement) {
        if (condition instanceof RawCondition) {
            this.buildRawCondition(condition, statement);
        } else if (condition instanceof BasicCondition) {
            this.buildBasicCondition(condition, statement);
        } else if (condition instanceof ConditionGroup) {
            this.buildConditionGroup(condition, statement);
        }
    }

    protected buildRawCondition(condition: RawCondition, statement: Statement) {
        statement.sql = condition.getSql();
        const bindings = condition.getBindings();
        if (bindings) {
            statement.bindings.push(...bindings);
        }
    }

    protected buildBasicCondition(condition: BasicCondition, statement: Statement) {
        this.buildField(condition.getField(), statement);
        statement.sql += DefaultQueryBuilder.SPACE;
        const operator = condition.getOperator();
        const value = condition.getValue();
        if (value === null && (operator === '=' || operator === '!=')) {
            statement.sql += DefaultQueryBuilder.SPACE;
            statement.sql += DefaultQueryBuilder.IS;
            statement.sql += DefaultQueryBuilder.SPACE;
            if (operator !== '=') {    
                statement.sql += DefaultQueryBuilder.NOT;
                statement.sql += DefaultQueryBuilder.SPACE;
            }
            statement.sql += DefaultQueryBuilder.NULL;
        } else {
            this.buildOperator(operator, statement);
            statement.sql += DefaultQueryBuilder.SPACE;
            if (value) {
                this.buildValue(value, statement);
            }
        }
    }

    protected buildConditionGroup(conditionGroup: ConditionGroup, statement: Statement) {
        let isFirst = true;
        for (const condition of conditionGroup.getConditions()) {
            if (!isFirst) {
                statement.sql += DefaultQueryBuilder.SPACE;
                statement.sql += condition.connector == ConditionConnector.AND ? DefaultQueryBuilder.AND : DefaultQueryBuilder.OR;
                statement.sql += DefaultQueryBuilder.SPACE;
            }
            if (condition.condition instanceof ConditionGroup) {
                statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
                this.buildConditionGroup (condition.condition, statement);
                statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
            } else {
                this.buildCondition(condition.condition, statement);
            }
            isFirst = false;
        }
    }

    protected buildTableName(tableName: string, statement: Statement) {
        statement.sql += tableName;
    }

    protected buildValue(value: any, statement: Statement) {
        if (Array.isArray(value)) {
            this.buildArrayValue(value, statement);
        } else if (typeof value === 'object' && value.field) {
            this.buildField(value, statement);
        } else {
            this.buildSingleValue(value, statement);
        }
    }

    protected buildArrayValue(value: Array<any>, statement: Statement) {
        statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
        let isFirst = true;
        for (const valueItem of value) {
            if (!isFirst) {
                statement.sql += DefaultQueryBuilder.COMMA;
                statement.sql += DefaultQueryBuilder.SPACE;
            }
            this.buildValue(valueItem, statement);
            isFirst = false;
        }
        statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
    }

    protected buildSingleValue(value: any, statement: Statement) {
        statement.sql += DefaultQueryBuilder.WILDCARD;
        statement.bindings.push(value);
    }

    protected buildOperator(operator: string, statement: Statement) {
        statement.sql += operator.toUpperCase();
    } 
}
