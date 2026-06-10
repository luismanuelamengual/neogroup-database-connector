import { applyMixins } from '../utilities'
import { HasTable, HasWhereConditions } from './features'
import { Query } from './Query'
import { QueryTable } from './QueryTable'

export class DeleteQuery extends Query {
  constructor(table?: QueryTable) {
    super()

    if (table) {
      this.setTable(table)
    }
  }
}

export interface DeleteQuery extends HasTable<DeleteQuery>, HasWhereConditions<DeleteQuery> {}
applyMixins(DeleteQuery, [HasTable, HasWhereConditions])
