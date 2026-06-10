import { applyMixins } from '../utilities'
import { HasFieldValues, HasTable } from './features'
import { Query } from './Query'
import { QueryTable } from './QueryTable'

export class InsertQuery extends Query {
  constructor(table?: QueryTable) {
    super()

    if (table) {
      this.setTable(table)
    }
  }
}

export interface InsertQuery extends HasTable<InsertQuery>, HasFieldValues<InsertQuery> {}
applyMixins(InsertQuery, [HasTable, HasFieldValues])
