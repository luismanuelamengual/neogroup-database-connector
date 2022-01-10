import {Query} from './query';
import {HasDistinct, HasFieldValues, HasSelectFields, HasTable, HasTableAlias, HasWhereConditions, HasJoins} from './features';
import {applyMixins} from '../utilities';

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
