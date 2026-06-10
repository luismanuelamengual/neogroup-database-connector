import { applyMixins } from '../utilities'
import { HasFieldValues, HasTable } from './features'
import { Query } from './Query'
import { Table } from './table'

export class InsertQuery extends Query {
  constructor(table?: Table) {
    super()

    if (table) {
      this.setTable(table)
    }
  }
}

export interface InsertQuery extends HasTable<InsertQuery>, HasFieldValues<InsertQuery> {}
applyMixins(InsertQuery, [HasTable, HasFieldValues])
