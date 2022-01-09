import {Query} from './query';
import {HasFieldValues, HasTable} from './features';
import {applyMixins} from '../utilities';

export class InsertQuery extends Query {

    constructor (tableName?: string) {
        super();
        this.setTableName(tableName);
    }
}

export interface InsertQuery extends HasTable<InsertQuery>, HasFieldValues<InsertQuery> {}
applyMixins(InsertQuery, [HasTable, HasFieldValues]);