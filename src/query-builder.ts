import {DataObject} from './data-object';
import {Statement} from './statement';

export abstract class QueryBuilder {
    public abstract getSelectStatement(dataObject: DataObject): Statement;
}
