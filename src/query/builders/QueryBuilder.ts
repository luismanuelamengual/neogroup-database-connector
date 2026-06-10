import { Query } from '../Query'
import { Statement } from '../Statement'

export abstract class QueryBuilder {
  public abstract buildQuery(query: Query): Statement
}
