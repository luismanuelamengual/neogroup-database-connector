import { applyMixins } from '../utilities';
import { HasAlias, HasDistinct, HasFieldValues, HasGroupByFields, HasHavingConditions, HasJoins, HasLimit, HasOffset, HasSelectFields, HasTable, HasWhereConditions } from './features';
import { HasOrderByFields } from './features/has-order-by-fields';
import { Query } from './query';
import { Table } from './table';

export class SelectQuery extends Query {

  constructor (table?: Table) {
    super();
    this.setTable(table);
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
  HasAlias<SelectQuery>,
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
  HasAlias,
  HasWhereConditions,
  HasJoins
]);
