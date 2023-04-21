import { applyMixins } from '../utilities';
import { HasFieldValues, HasTable, HasWhereConditions } from './features';
import { Query } from './query';

export class UpdateQuery extends Query {

  constructor (tableName?: string) {
    super();
    this.setTableName(tableName);
  }
}

export interface UpdateQuery extends
  HasTable<UpdateQuery>,
  HasFieldValues<UpdateQuery>,
  HasWhereConditions<UpdateQuery> {}
applyMixins(UpdateQuery, [
  HasTable,
  HasFieldValues,
  HasWhereConditions
]);