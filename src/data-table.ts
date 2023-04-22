import { DataSet } from './data-set';
import { DataSource } from './data-source';
import { DeleteQuery, HasDistinct, HasFieldValues, HasGroupByFields, HasHavingConditions, HasJoins, HasLimit, HasOffset, HasSelectFields, HasTable, HasTableAlias, HasWhereConditions, InsertQuery, SelectQuery, UpdateQuery } from './query';
import { HasOrderByFields } from './query/features/has-order-by-fields';
import { applyMixins } from './utilities';

export class DataTable {
  private source: DataSource;

  constructor(source: DataSource, name: string) {
    this.source = source;
    this.setTableName(name);
  }

  public async find(): Promise<Array<DataSet>> {
    const selectQuery = new SelectQuery();
    selectQuery.setTableName(this.tableName);
    selectQuery.distinct(this._distinct);
    selectQuery.setLimit(this.limit);
    selectQuery.setOffset(this.offset);
    selectQuery.setOrderByFields(this.orderByFields);
    selectQuery.setGroupByFields(this.groupByFields);
    selectQuery.fields(this._fields);
    selectQuery.setSelectFields(this.selectFields);
    selectQuery.setTableAlias(this.tableAlias);
    selectQuery.setWhereConditions(this.whereConditions);
    selectQuery.setHavingConditions(this.havingConditions);
    selectQuery.setJoins(this.joins);
    const connection = await this.source.getConnection();
    try {
      return await connection.query(selectQuery);
    } finally {
      await connection.close();
    }
  }

  public async first(): Promise<DataSet | null> {
    const selectQuery = new SelectQuery();
    selectQuery.setTableName(this.tableName);
    selectQuery.distinct(this._distinct);
    selectQuery.setLimit(1);
    selectQuery.setOffset(this.offset);
    selectQuery.setOrderByFields(this.orderByFields);
    selectQuery.setGroupByFields(this.groupByFields);
    selectQuery.fields(this._fields);
    selectQuery.setSelectFields(this.selectFields);
    selectQuery.setTableAlias(this.tableAlias);
    selectQuery.setWhereConditions(this.whereConditions);
    selectQuery.setHavingConditions(this.havingConditions);
    selectQuery.setJoins(this.joins);
    const connection = await this.source.getConnection();
    try {
      const records = await connection.query(selectQuery);
      return records && records.length > 0 ? records[0] : null;
    } finally {
      await connection.close();
    }
  }

  public async insert(): Promise<number> {
    const insertQuery = new InsertQuery();
    insertQuery.setTableName(this.tableName);
    insertQuery.fields(this._fields);
    const connection = await this.source.getConnection();
    try {
      return await connection.execute(insertQuery);
    } finally {
      await connection.close();
    }
  }

  public async update(): Promise<number> {
    const updateQuery = new UpdateQuery();
    updateQuery.setTableName(this.tableName);
    updateQuery.fields(this._fields);
    updateQuery.setWhereConditions(this.whereConditions);
    const connection = await this.source.getConnection();
    try {
      return await connection.execute(updateQuery);
    } finally {
      await connection.close();
    }
  }

  public async delete(): Promise<number> {
    const deleteQuery = new DeleteQuery();
    deleteQuery.setTableName(this.tableName);
    deleteQuery.setWhereConditions(this.whereConditions);
    const connection = await this.source.getConnection();
    try {
      return await connection.execute(deleteQuery);
    } finally {
      await connection.close();
    }
  }
}

export interface DataTable extends
  HasDistinct<DataTable>,
  HasLimit<DataTable>,
  HasOffset<DataTable>,
  HasOrderByFields<DataTable>,
  HasGroupByFields<DataTable>,
  HasFieldValues<DataTable>,
  HasSelectFields<DataTable>,
  HasTable<DataTable>,
  HasTableAlias<DataTable>,
  HasWhereConditions<DataTable>,
  HasHavingConditions<DataTable>,
  HasJoins<DataTable> {}
applyMixins(DataTable, [
  HasDistinct,
  HasLimit,
  HasOffset,
  HasOrderByFields,
  HasGroupByFields,
  HasFieldValues,
  HasSelectFields,
  HasTable,
  HasTableAlias,
  HasWhereConditions,
  HasHavingConditions,
  HasJoins
]);
