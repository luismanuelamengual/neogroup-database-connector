import { DefaultQueryBuilder, Statement } from '../../query';

export class PostgresQueryBuilder extends DefaultQueryBuilder {

  private static readonly CURRENCY = '$';

  protected buildSingleValue(value: any, statement: Statement) {
    statement.sql += PostgresQueryBuilder.CURRENCY + (statement.bindings.length + 1);
    statement.bindings.push(value);
  }
}
