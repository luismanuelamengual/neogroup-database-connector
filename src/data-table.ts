import {SelectQuery, HasDistinct, HasFields, HasSelectFields, HasTable} from './query';
import {DataSet} from './data-set';
import {DataSource} from './data-source';
import {applyMixins} from './utilities';

export class DataTable {
    private source: DataSource;
    
    constructor(source: DataSource, name: string) {
        this.source = source;
        this.setTableName(name);
    }

    public async find(): Promise<Array<DataSet>> {
        const selectQuery = new SelectQuery();
        selectQuery.setTableName(this.tableName);
        selectQuery.setDistinct(this.distinct);
        selectQuery.setFields(this.fields);
        selectQuery.setSelectFields(this.selectFields);
        const connection = await this.source.getConnection();
        const resultSet = connection.query(selectQuery); 
        await connection.close();
        return resultSet;
    }
}

export interface DataTable extends HasDistinct<DataTable>, HasFields<DataTable>, HasSelectFields<DataTable>, HasTable<DataTable> {}
applyMixins(DataTable, [HasDistinct, HasFields, HasSelectFields, HasTable]);
