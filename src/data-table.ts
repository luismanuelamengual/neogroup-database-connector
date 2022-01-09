import {SelectQuery, InsertQuery, HasDistinct, HasFieldValues, HasSelectFields, HasTable, HasTableAlias, HasWhereConditions} from './query';
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
        selectQuery.setFieldValues(this.fieldValues);
        selectQuery.setSelectFields(this.selectFields);
        selectQuery.setTableAlias(this.tableAlias);
        selectQuery.setWhereConditions(this.whereConditions);
        const connection = await this.source.getConnection();
        try {
            return await connection.query(selectQuery);
        } finally {
            await connection.close();
        } 
    }

    public async insert(): Promise<number> {
        const insertQuery = new InsertQuery();
        insertQuery.setTableName(this.tableName);
        insertQuery.setFieldValues(this.fieldValues);
        const connection = await this.source.getConnection();
        try {
            return await connection.execute(insertQuery)
        } finally {
            await connection.close();
        }
    }
}

export interface DataTable extends 
    HasDistinct<DataTable>, 
    HasFieldValues<DataTable>, 
    HasSelectFields<DataTable>, 
    HasTable<DataTable>, 
    HasTableAlias<DataTable>,
    HasWhereConditions<DataTable> {}
applyMixins(DataTable, [
    HasDistinct, 
    HasFieldValues, 
    HasSelectFields, 
    HasTable, 
    HasTableAlias,
    HasWhereConditions
]);
