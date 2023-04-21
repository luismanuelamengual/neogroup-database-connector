import { applyMixins } from '../utilities';
import { HasTable, HasWhereConditions } from './features';
import { Query } from './query';

export class DeleteQuery extends Query {

  constructor (tableName?: string) {
    super();
    this.setTableName(tableName);
  }
}

export interface DeleteQuery extends
  HasTable<DeleteQuery>,
  HasWhereConditions<DeleteQuery> {}
applyMixins(DeleteQuery, [
  HasTable,
  HasWhereConditions
]);