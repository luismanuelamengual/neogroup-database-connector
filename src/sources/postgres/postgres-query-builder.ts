import {Statement, DefaultQueryBuilder} from '../../query';

export class PostgresQueryBuilder extends DefaultQueryBuilder {
    
    private static readonly CURRENCY = '$';

    protected buildTableName(tableName: string, statement: Statement) {
        statement.sql += (tableName === 'user')? ('"' + tableName + '"') : tableName;
    }

    protected buildValue(value: any, statement: Statement) {
        statement.sql += PostgresQueryBuilder.CURRENCY + (statement.bindings.length + 1);
        statement.bindings.push(value);
    }
}
