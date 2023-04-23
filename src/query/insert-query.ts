import { applyMixins } from '../utilities';
import { HasFieldValues, HasTable } from './features';
import { Query } from './query';
import { Table } from './table';

export class InsertQuery extends Query {

  constructor (table?: Table) {
    super();
    this.setTable(table);
  }
}

export interface InsertQuery extends HasTable<InsertQuery>, HasFieldValues<InsertQuery> {}
applyMixins(InsertQuery, [HasTable, HasFieldValues]);