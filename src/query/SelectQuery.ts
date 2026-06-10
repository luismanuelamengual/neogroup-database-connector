import { applyMixins } from '../utilities'
import {
  HasAlias,
  HasDistinct,
  HasFieldValues,
  HasGroupByFields,
  HasHavingConditions,
  HasJoins,
  HasLimit,
  HasOffset,
  HasSelectFields,
  HasTable,
  HasUnions,
  HasWhen,
  HasWhereConditions
} from './features'
import { HasOrderByFields } from './features/HasOrderByFields'
import { Query } from './Query'
import { QueryTable } from './QueryTable'

export class SelectQuery extends Query {
  constructor(table?: QueryTable) {
    super()

    if (table) {
      this.setTable(table)
    }
  }
}

export interface SelectQuery
  extends HasDistinct<SelectQuery>,
    HasLimit<SelectQuery>,
    HasOffset<SelectQuery>,
    HasOrderByFields<SelectQuery>,
    HasGroupByFields<SelectQuery>,
    HasHavingConditions<SelectQuery>,
    HasFieldValues<SelectQuery>,
    HasSelectFields<SelectQuery>,
    HasTable<SelectQuery>,
    HasAlias<SelectQuery>,
    HasWhereConditions<SelectQuery>,
    HasJoins<SelectQuery>,
    HasUnions<SelectQuery>,
    HasWhen<SelectQuery> {}
applyMixins(SelectQuery, [
  HasDistinct,
  HasLimit,
  HasOffset,
  HasOrderByFields,
  HasGroupByFields,
  HasHavingConditions,
  HasFieldValues,
  HasSelectFields,
  HasTable,
  HasAlias,
  HasWhereConditions,
  HasJoins,
  HasUnions,
  HasWhen
])
