import { DefaultQueryBuilder } from '../../query/builders/DefaultQueryBuilder'
import { SelectQuery } from '../../query/SelectQuery'
import { Statement } from '../../query/Statement'

export class SqliteQueryBuilder extends DefaultQueryBuilder {
  protected buildOperator(operator: string, statement: Statement) {
    // SQLite LIKE is already case-insensitive; translate ILIKE (default) → LIKE
    const upper = operator.toUpperCase()

    statement.sql += upper === 'ILIKE' ? 'LIKE' : upper === 'NOT ILIKE' ? 'NOT LIKE' : upper
  }

  protected buildLimitOffset(query: SelectQuery, statement: Statement) {
    // SQLite requiere LIMIT cuando se usa OFFSET; LIMIT -1 significa sin límite
    if (query.getLimit() >= 0 || query.getOffset() >= 0) {
      statement.sql += DefaultQueryBuilder.SPACE
      statement.sql += DefaultQueryBuilder.LIMIT
      statement.sql += DefaultQueryBuilder.SPACE
      statement.sql += query.getLimit() >= 0 ? query.getLimit() : -1
    }

    if (query.getOffset() >= 0) {
      statement.sql += DefaultQueryBuilder.SPACE
      statement.sql += DefaultQueryBuilder.OFFSET
      statement.sql += DefaultQueryBuilder.SPACE
      statement.sql += query.getOffset()
    }
  }
}
