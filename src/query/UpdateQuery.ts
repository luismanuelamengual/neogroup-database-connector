import { applyMixins } from '../utilities'
import { HasFieldValues, HasTable, HasWhereConditions } from './features'
import { Query } from './Query'
import { Table } from './table'

export class UpdateQuery extends Query {
  constructor(table?: Table) {
    super()

    if (table) {
      this.setTable(table)
    }
  }
}

export interface UpdateQuery
  extends HasTable<UpdateQuery>,
    HasFieldValues<UpdateQuery>,
    HasWhereConditions<UpdateQuery> {}
applyMixins(UpdateQuery, [HasTable, HasFieldValues, HasWhereConditions])
