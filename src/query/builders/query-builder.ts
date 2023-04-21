import { Query } from '../query';
import { Statement } from '../statement';

export abstract class QueryBuilder {
  public abstract buildQuery(query: Query): Statement;
}
