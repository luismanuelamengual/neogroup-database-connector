import {Query} from './query';
import {Statement} from '../statement';

export abstract class QueryBuilder {
    public abstract getSelectStatement(query: Query): Statement;
}
