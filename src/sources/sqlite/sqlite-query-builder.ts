import { DefaultQueryBuilder } from '../../query/builders/default-query-builder'
import { SelectQuery } from '../../query/select-query'
import { Statement } from '../../query/statement'

export class SqliteQueryBuilder extends DefaultQueryBuilder {
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
