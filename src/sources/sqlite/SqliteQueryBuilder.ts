import { DefaultQueryBuilder } from '../../query/builders/DefaultQueryBuilder'
import { SelectQuery } from '../../query/SelectQuery'
import { Statement } from '../../query/Statement'

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
