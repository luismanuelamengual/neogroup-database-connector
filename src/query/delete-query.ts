import { applyMixins } from '../utilities';
import { HasTable, HasWhereConditions } from './features';
import { Query } from './query';
import { Table } from './table';

export class DeleteQuery extends Query {

  constructor (table?: Table) {
    super();
    this.setTable(table);
  }
}

export interface DeleteQuery extends
  HasTable<DeleteQuery>,
  HasWhereConditions<DeleteQuery> {}
applyMixins(DeleteQuery, [
  HasTable,
  HasWhereConditions
]);