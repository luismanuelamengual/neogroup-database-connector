import { applyMixins } from '../../utilities'
import { HasFieldValues, HasTable, HasWhereConditions } from './features'
import { Query } from './Query'
import { QueryTable } from './QueryTable'

export class UpdateQuery extends Query {
  constructor(table?: QueryTable) {
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
