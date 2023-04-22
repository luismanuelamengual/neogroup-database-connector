import { applyMixins } from '../utilities';
import { HasDistinct, HasFieldValues, HasGroupByFields, HasHavingConditions, HasJoins, HasLimit, HasOffset, HasSelectFields, HasTable, HasTableAlias, HasWhereConditions } from './features';
import { HasOrderByFields } from './features/has-order-by-fields';
import { Query } from './query';

export class SelectQuery extends Query {

  constructor (tableName?: string) {
    super();
    this.setTableName(tableName);
  }
}

export interface SelectQuery extends
  HasDistinct<SelectQuery>,
  HasLimit<SelectQuery>,
  HasOffset<SelectQuery>,
  HasOrderByFields<SelectQuery>,
  HasGroupByFields<SelectQuery>,
  HasHavingConditions<SelectQuery>,
  HasFieldValues<SelectQuery>,
  HasSelectFields<SelectQuery>,
  HasTable<SelectQuery>,
  HasTableAlias<SelectQuery>,
  HasWhereConditions<SelectQuery>,
  HasJoins<SelectQuery> {}
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
  HasTableAlias,
  HasWhereConditions,
  HasJoins
]);
