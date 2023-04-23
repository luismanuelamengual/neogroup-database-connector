import { applyMixins } from '../utilities';
import { HasFieldValues, HasTable, HasWhereConditions } from './features';
import { Query } from './query';
import { Table } from './table';

export class UpdateQuery extends Query {

  constructor (table?: Table) {
    super();
    this.setTable(table);
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