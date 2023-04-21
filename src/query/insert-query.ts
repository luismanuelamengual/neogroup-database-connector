import { applyMixins } from '../utilities';
import { HasFieldValues, HasTable } from './features';
import { Query } from './query';

export class InsertQuery extends Query {

  constructor (tableName?: string) {
    super();
    this.setTableName(tableName);
  }
}

export interface InsertQuery extends HasTable<InsertQuery>, HasFieldValues<InsertQuery> {}
applyMixins(InsertQuery, [HasTable, HasFieldValues]);