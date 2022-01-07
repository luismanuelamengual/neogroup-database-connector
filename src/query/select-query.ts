import {Query} from './query';
import {HasDistinct, HasFields, HasSelectFields, HasTable, HasTableAlias, HasWhereConditions} from './features';
import {applyMixins} from '../utilities';

export class SelectQuery extends Query {

    constructor (tableName?: string) {
        super();
        this.setTableName(tableName);
    }
}

export interface SelectQuery extends 
    HasDistinct<SelectQuery>, 
    HasFields<SelectQuery>, 
    HasSelectFields<SelectQuery>, 
    HasTable<SelectQuery>, 
    HasTableAlias<SelectQuery>,
    HasWhereConditions<SelectQuery> {}
applyMixins(SelectQuery, [
    HasDistinct, 
    HasFields, 
    HasSelectFields, 
    HasTable, 
    HasTableAlias, 
    HasWhereConditions
]);
