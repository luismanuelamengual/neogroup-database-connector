import {Query} from './query';
import {HasFields, HasTable} from './features';
import {applyMixins} from '../utilities';

export class InsertQuery extends Query {

    constructor (tableName?: string) {
        super();
        this.setTableName(tableName);
    }
}

export interface InsertQuery extends HasTable<InsertQuery>, HasFields<InsertQuery> {}
applyMixins(InsertQuery, [HasTable, HasFields]);