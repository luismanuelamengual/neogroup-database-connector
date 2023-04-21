import { applyMixins } from '../utilities';
import { HasDistinct, HasFieldValues, HasJoins, HasSelectFields, HasTable, HasTableAlias, HasWhereConditions } from './features';
import { Query } from './query';

export class SelectQuery extends Query {

  constructor (tableName?: string) {
    super();
    this.setTableName(tableName);
  }
}

export interface SelectQuery extends
  HasDistinct<SelectQuery>,
  HasFieldValues<SelectQuery>,
  HasSelectFields<SelectQuery>,
  HasTable<SelectQuery>,
  HasTableAlias<SelectQuery>,
  HasWhereConditions<SelectQuery>,
  HasJoins<SelectQuery> {}
applyMixins(SelectQuery, [
  HasDistinct,
  HasFieldValues,
  HasSelectFields,
  HasTable,
  HasTableAlias,
  HasWhereConditions,
  HasJoins
]);
