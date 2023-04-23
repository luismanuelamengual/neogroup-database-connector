import { Condition, ConditionConnector, ConditionField, ConditionGroup } from '../condition-group';
import { DeleteQuery } from '../delete-query';
import { GroupByField, Join, JoinTable, JoinType, OrderByField, SelectField } from '../features';
import { InsertQuery } from '../insert-query';
import { Query } from '../query';
import { SelectQuery } from '../select-query';
import { Statement } from '../statement';
import { UpdateQuery } from '../update-query';
import { QueryBuilder } from './query-builder';

export class DefaultQueryBuilder extends QueryBuilder {

  protected static readonly SPACE = ' ';
  protected static readonly COMMA = ',';
  protected static readonly DOUBLE_QUOTES = '"';
  protected static readonly EQUALS = '=';
  protected static readonly PARENTHESIS_START = '(';
  protected static readonly PARENTHESIS_END = ')';
  protected static readonly SELECT = 'SELECT';
  protected static readonly INSERT = 'INSERT';
  protected static readonly UPDATE = 'UPDATE';
  protected static readonly DELETE = 'DELETE';
  protected static readonly INTO = 'INTO';
  protected static readonly SET = 'SET';
  protected static readonly VALUES = 'VALUES';
  protected static readonly DISTINCT = 'DISTINCT';
  protected static readonly ALL = '*';
  protected static readonly AS = 'AS';
  protected static readonly POINT = '.';
  protected static readonly FROM = 'FROM';
  protected static readonly AND = 'AND';
  protected static readonly OR = 'OR';
  protected static readonly NULL = 'NULL';
  protected static readonly IS = 'IS';
  protected static readonly NOT = 'NOT';
  protected static readonly ON = 'ON';
  protected static readonly WHERE = 'WHERE';
  protected static readonly HAVING = 'HAVING';
  protected static readonly GROUP = 'GROUP';
  protected static readonly ORDER = 'ORDER';
  protected static readonly BY = 'BY';
  protected static readonly LIMIT = 'LIMIT';
  protected static readonly OFFSET = 'OFFSET';
  protected static readonly ASC = 'ASC';
  protected static readonly DESC = 'DESC';
  protected static readonly JOIN = 'JOIN';
  protected static readonly INNER = 'INNER';
  protected static readonly OUTER = 'OUTER';
  protected static readonly LEFT = 'LEFT';
  protected static readonly RIGHT = 'RIGHT';
  protected static readonly CROSS = 'CROSS';
  protected static readonly WILDCARD = '?';

  public buildQuery(query: Query): Statement {
    const statement = {sql: '', bindings: []};
    if (query instanceof SelectQuery) {
      this.buildSelectQuery(query, statement);
    } else if (query instanceof InsertQuery) {
      this.buildInsertQuery(query, statement);
    } else if (query instanceof UpdateQuery) {
      this.buildUpdateQuery(query, statement);
    } else if (query instanceof DeleteQuery) {
      this.buildDeleteQuery(query, statement);
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
    this.buildTableName(query.getTable(), statement);

    const tableAlias = query.getAlias();
    if (tableAlias != null) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.AS;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += tableAlias;
    }

    const joins = query.getJoins();
    if (joins != null && joins.length > 0) {
      for (const join of joins) {
        statement.sql += DefaultQueryBuilder.SPACE;
        this.buildJoin(join, statement);
      }
    }

    const whereConditions = query.getWhereConditions();
    if (whereConditions && whereConditions.getConditions().length > 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.WHERE;
      statement.sql += DefaultQueryBuilder.SPACE;
      this.buildConditionGroup(whereConditions, statement);
    }

    const groupByFields = query.getGroupByFields();
    if (groupByFields && groupByFields.length > 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.GROUP;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.BY;
      statement.sql += DefaultQueryBuilder.SPACE;
      let isFirst = true;
      for (const field of groupByFields) {
        if (!isFirst) {
          statement.sql += DefaultQueryBuilder.COMMA;
          statement.sql += DefaultQueryBuilder.SPACE;
        }
        this.buildGroupByField(field, statement);
        isFirst = false;
      }
    }

    const havingConditions = query.getHavingConditions();
    if (havingConditions && havingConditions.getConditions().length > 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.HAVING;
      statement.sql += DefaultQueryBuilder.SPACE;
      this.buildConditionGroup(havingConditions, statement);
    }

    const orderByFields = query.getOrderByFields();
    if (orderByFields && orderByFields.length > 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.ORDER;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.BY;
      statement.sql += DefaultQueryBuilder.SPACE;
      let isFirst = true;
      for (const field of orderByFields) {
        if (!isFirst) {
          statement.sql += DefaultQueryBuilder.COMMA;
          statement.sql += DefaultQueryBuilder.SPACE;
        }
        this.buildOrderByField(field, statement);
        isFirst = false;
      }
    }

    if (query.getOffset() >= 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.OFFSET;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += query.getOffset();
    }

    if (query.getLimit() >= 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.LIMIT;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += query.getLimit();
    }
  }

  protected buildInsertQuery(query: InsertQuery, statement: Statement) {
    statement.sql += DefaultQueryBuilder.INSERT;
    statement.sql += DefaultQueryBuilder.SPACE;
    statement.sql += DefaultQueryBuilder.INTO;
    statement.sql += DefaultQueryBuilder.SPACE;
    this.buildTableName(query.getTable(), statement);
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

  protected buildUpdateQuery(query: UpdateQuery, statement: Statement) {
    statement.sql += DefaultQueryBuilder.UPDATE;
    statement.sql += DefaultQueryBuilder.SPACE;
    this.buildTableName(query.getTable(), statement);
    statement.sql += DefaultQueryBuilder.SPACE;
    statement.sql += DefaultQueryBuilder.SET;
    statement.sql += DefaultQueryBuilder.SPACE;
    const fields = query.getFields();
    let isFirst = true;
    for (const fieldName in fields) {
      if (!isFirst) {
        statement.sql += DefaultQueryBuilder.COMMA;
        statement.sql += DefaultQueryBuilder.SPACE;
      }
      statement.sql += fieldName;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.EQUALS;
      statement.sql += DefaultQueryBuilder.SPACE;
      this.buildValue(fields[fieldName], statement);
      isFirst = false;
    }
    const whereConditions = query.getWhereConditions();
    if (whereConditions && whereConditions.getConditions().length > 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.WHERE;
      statement.sql += DefaultQueryBuilder.SPACE;
      this.buildConditionGroup(whereConditions, statement);
    }
  }

  protected buildDeleteQuery(query: DeleteQuery, statement: Statement) {
    statement.sql += DefaultQueryBuilder.DELETE;
    statement.sql += DefaultQueryBuilder.SPACE;
    statement.sql += DefaultQueryBuilder.FROM;
    statement.sql += DefaultQueryBuilder.SPACE;
    this.buildTableName(query.getTable(), statement);
    const whereConditions = query.getWhereConditions();
    if (whereConditions && whereConditions.getConditions().length > 0) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.WHERE;
      statement.sql += DefaultQueryBuilder.SPACE;
      this.buildConditionGroup(whereConditions, statement);
    }
  }

  protected buildSelectField(field: SelectField, statement: Statement) {
    if (typeof field === 'string' || field instanceof String) {
      statement.sql += field;
    } else {
      if (field.function) {
        statement.sql += field.function.toUpperCase();
        statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
      }
      if (field.schema) {
        statement.sql += field.schema;
        statement.sql += DefaultQueryBuilder.POINT;
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

  protected buildOrderByField(field: OrderByField, statement: Statement) {
    if (typeof field === 'string' || field instanceof String) {
      statement.sql += field;
    } else if (field instanceof Array) {
      const [fieldName, direction] = field;
      statement.sql += fieldName;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += direction;
    } else {
      if (field.schema) {
        statement.sql += field.schema;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      if (field.table) {
        statement.sql += field.table;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      statement.sql += field.name;
      if (field.direction) {
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += field.direction;
      }
    }
  }

  protected buildGroupByField(field: GroupByField, statement: Statement) {
    if (typeof field === 'string' || field instanceof String) {
      statement.sql += field;
    } else {
      if (field.schema) {
        statement.sql += field.schema;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      if (field.table) {
        statement.sql += field.table;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      statement.sql += field.name;
    }
  }

  protected buildCondition(condition: Condition, statement: Statement) {
    if (typeof condition === 'string' || condition instanceof String) {
      statement.sql += condition;
    } else if (condition instanceof ConditionGroup) {
      this.buildConditionGroup(condition, statement);
    } else if ('sql' in condition) {
      const { sql, bindings } = condition;
      statement.sql = sql;
      statement.bindings.push(...bindings);
    } else if ('field' in condition) {
      const { field, operator, value } = condition;
      this.buildConditionField(field, statement);
      statement.sql += DefaultQueryBuilder.SPACE;
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
  }

  protected buildConditionGroup(conditionGroup: ConditionGroup, statement: Statement) {
    let isFirst = true;
    for (const { connector, condition } of conditionGroup.getConditions()) {
      if (!isFirst) {
        statement.sql += DefaultQueryBuilder.SPACE;
        statement.sql += connector == ConditionConnector.AND ? DefaultQueryBuilder.AND : DefaultQueryBuilder.OR;
        statement.sql += DefaultQueryBuilder.SPACE;
      }
      if (condition instanceof ConditionGroup) {
        statement.sql += DefaultQueryBuilder.PARENTHESIS_START;
        this.buildConditionGroup(condition, statement);
        statement.sql += DefaultQueryBuilder.PARENTHESIS_END;
      } else {
        this.buildCondition(condition, statement);
      }
      isFirst = false;
    }
  }

  protected buildConditionField(field: ConditionField, statement: Statement) {
    if (typeof field === 'string' || field instanceof String) {
      statement.sql += field;
    } else {
      if (field.schema) {
        statement.sql += field.schema;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      if (field.table) {
        statement.sql += field.table;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      statement.sql += field.name;
    }
  }

  protected buildJoin(join: Join, statement: Statement) {
    const { type, table, condition, alias } = join;
    switch (type) {
      case JoinType.INNER_JOIN:
        statement.sql += DefaultQueryBuilder.INNER;
        statement.sql += DefaultQueryBuilder.SPACE;
        break;
      case JoinType.OUTER_JOIN:
        statement.sql += DefaultQueryBuilder.OUTER;
        statement.sql += DefaultQueryBuilder.SPACE;
        break;
      case JoinType.LEFT_JOIN:
        statement.sql += DefaultQueryBuilder.LEFT;
        statement.sql += DefaultQueryBuilder.SPACE;
        break;
      case JoinType.RIGHT_JOIN:
        statement.sql += DefaultQueryBuilder.RIGHT;
        statement.sql += DefaultQueryBuilder.SPACE;
        break;
      case JoinType.CROSS_JOIN:
        statement.sql += DefaultQueryBuilder.CROSS;
        statement.sql += DefaultQueryBuilder.SPACE;
        break;
    }
    statement.sql += DefaultQueryBuilder.JOIN;
    statement.sql += DefaultQueryBuilder.SPACE;
    this.buildJoinTable(table, statement);

    if (alias) {
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += DefaultQueryBuilder.AS;
      statement.sql += DefaultQueryBuilder.SPACE;
      statement.sql += alias;
    }
    statement.sql += DefaultQueryBuilder.SPACE;
    statement.sql += DefaultQueryBuilder.ON;
    statement.sql += DefaultQueryBuilder.SPACE;
    this.buildConditionGroup(condition, statement);
  }

  protected buildJoinTable(table: JoinTable, statement: Statement) {
    if (typeof table === 'string' || table instanceof String) {
      statement.sql += table;
    } else {
      if (table.schema) {
        statement.sql += table.schema;
        statement.sql += DefaultQueryBuilder.POINT;
      }
      statement.sql += table.name;
    }
  }

  protected buildTableName(tableName: string, statement: Statement) {
    statement.sql += tableName;
  }

  protected buildValue(value: any, statement: Statement) {
    if (Array.isArray(value)) {
      this.buildArrayValue(value, statement);
    } else if (value instanceof SelectQuery) {
      this.buildSelectQuery(value, statement);
    } else if (typeof value === 'object') {
      this.buildConditionField(value, statement);
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
      this.buildSingleValue(valueItem, statement);
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
