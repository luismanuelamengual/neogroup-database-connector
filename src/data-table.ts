import { DataSet } from './data-set';
import { DataSource } from './data-source';
import { DeleteQuery, HasAlias, HasDistinct, HasFieldValues, HasGroupByFields, HasHavingConditions, HasJoins, HasLimit, HasOffset, HasSelectFields, HasTable, HasWhereConditions, InsertQuery, SelectQuery, UpdateQuery } from './query';
import { HasOrderByFields } from './query/features/has-order-by-fields';
import { applyMixins } from './utilities';

export class DataTable {
  private source: DataSource;

  constructor(source: DataSource, name: string) {
    this.source = source;
    this.setTable(name);
  }

  public async find(): Promise<Array<DataSet>> {
    const selectQuery = new SelectQuery();
    selectQuery.setTable(this._table);
    selectQuery.setDistinct(this._distinct);
    selectQuery.setLimit(this._limit);
    selectQuery.setOffset(this._offset);
    selectQuery.setOrderByFields(this._orderByFields);
    selectQuery.setGroupByFields(this._groupByFields);
    selectQuery.setFields(this._fields);
    selectQuery.setSelectFields(this._selectFields);
    selectQuery.setAlias(this._alias);
    selectQuery.setWhereConditions(this._whereConditions);
    selectQuery.setHavingConditions(this._havingConditions);
    selectQuery.setJoins(this._joins);
    const connection = await this.source.getConnection();
    try {
      return await connection.query(selectQuery);
    } finally {
      await connection.close();
    }
  }

  public async first(): Promise<DataSet | null> {
    const selectQuery = new SelectQuery();
    selectQuery.setTable(this._table);
    selectQuery.setDistinct(this._distinct);
    selectQuery.setLimit(1);
    selectQuery.setOffset(this._offset);
    selectQuery.setOrderByFields(this._orderByFields);
    selectQuery.setGroupByFields(this._groupByFields);
    selectQuery.setFields(this._fields);
    selectQuery.setSelectFields(this._selectFields);
    selectQuery.setAlias(this._alias);
    selectQuery.setWhereConditions(this._whereConditions);
    selectQuery.setHavingConditions(this._havingConditions);
    selectQuery.setJoins(this._joins);
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
    insertQuery.setTable(this._table);
    insertQuery.setFields(this._fields);
    const connection = await this.source.getConnection();
    try {
      return await connection.execute(insertQuery);
    } finally {
      await connection.close();
    }
  }

  public async update(): Promise<number> {
    const updateQuery = new UpdateQuery();
    updateQuery.setTable(this._table);
    updateQuery.setFields(this._fields);
    updateQuery.setWhereConditions(this._whereConditions);
    const connection = await this.source.getConnection();
    try {
      return await connection.execute(updateQuery);
    } finally {
      await connection.close();
    }
  }

  public async delete(): Promise<number> {
    const deleteQuery = new DeleteQuery();
    deleteQuery.setTable(this._table);
    deleteQuery.setWhereConditions(this._whereConditions);
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
  HasAlias<DataTable>,
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
  HasAlias,
  HasWhereConditions,
  HasHavingConditions,
  HasJoins
]);
