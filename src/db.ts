import { DataConnection } from './data-connection';
import { DataSource } from './data-source';
import { DataTable } from './data-table';
import { ConditionGroup, DeleteQuery, InsertQuery, SelectQuery, Table, UpdateQuery } from './query';

export abstract class DB {
  private static sources = new Map<string, DataSource>();

  public static register(source: DataSource);
  public static register(sourceName: string, source: DataSource);
  public static register(sourceOrName: DataSource | string, source?: DataSource) {
    const sourceName = source ? (sourceOrName as string) : 'source' + (this.sources.size + 1);
    const sourceToRegister = source ?? (sourceOrName as DataSource);
    this.sources.set(sourceName, sourceToRegister);
  }

  public static source(sourceName: string): DataSource {
    const source = this.sources.get(sourceName);
    if (!source) {
      throw new Error(`No DataSource registered with the name "${sourceName}" !!`);
    }
    return source;
  }

  public static table(tableName: string): DataTable {
    return this.activeSource.table(tableName);
  }

  public static connection(): Promise<DataConnection> {
    return this.activeSource.getConnection();
  }

  public static conditionGroup(): ConditionGroup {
    return new ConditionGroup();
  }

  public static selectQuery(table?: Table): SelectQuery {
    return new SelectQuery(table);
  }

  public static updateQuery(table?: Table): UpdateQuery {
    return new UpdateQuery(table);
  }

  public static deleteQuery(table?: Table): DeleteQuery {
    return new DeleteQuery(table);
  }

  public static insertQuery(table?: Table): InsertQuery {
    return new InsertQuery(table);
  }

  private static get activeSource(): DataSource {
    if (this.sources.size == 0) {
      throw new Error('No DataSources registered !!. Register a DataSource with the "DB.register" method');
    }
    return this.sources.values().next().value;
  }
}