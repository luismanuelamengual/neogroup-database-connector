import { DataConnection } from './data-connection';
import { DataSource } from './data-source';
import { DataTable } from './data-table';

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
    return this.activeSource.getTable(tableName);
  }

  public static connection(): Promise<DataConnection> {
    return this.activeSource.getConnection();
  }

  private static get activeSource(): DataSource {
    if (this.sources.size == 0) {
      throw new Error('No DataSources registered !!. Register a DataSource with the "DB.register" method');
    }
    return this.sources.values().next().value;
  }
}