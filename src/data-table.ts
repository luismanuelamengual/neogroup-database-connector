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
    return await this.source.query(this.createSelectQuery());
  }

  public async first(): Promise<DataSet | null> {
    const records = await this.source.query(this.createSelectQuery().setLimit(1));
    return records && records.length > 0 ? records[0] : null;
  }

  public async insert(): Promise<number> {
    return await this.source.execute(this.createInsertQuery());
  }

  public async update(): Promise<number> {
    return await this.source.execute(this.createUpdateQuery());
  }

  public async delete(): Promise<number> {
    return await this.source.execute(this.createDeleteQuery());
  }

  private createSelectQuery(): SelectQuery {
    return new SelectQuery()
      .setTable(this._table)
      .setDistinct(this._distinct)
      .setLimit(this._limit)
      .setOffset(this._offset)
      .setOrderByFields(this._orderByFields)
      .setGroupByFields(this._groupByFields)
      .setFields(this._fields)
      .setSelectFields(this._selectFields)
      .setAlias(this._alias)
      .setWhereConditions(this._whereConditions)
      .setHavingConditions(this._havingConditions)
      .setJoins(this._joins);
  }

  private createInsertQuery(): InsertQuery {
    return new InsertQuery()
      .setTable(this._table)
      .setFields(this._fields);
  }

  private createUpdateQuery(): UpdateQuery {
    return new UpdateQuery()
      .setTable(this._table)
      .setFields(this._fields)
      .setWhereConditions(this._whereConditions);
  }

  private createDeleteQuery(): DeleteQuery {
    return new DeleteQuery()
      .setTable(this._table)
      .setWhereConditions(this._whereConditions);
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
