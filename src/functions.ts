import { Connection } from './connection';
import { DataSource } from './data-source';
import { DataSources } from './data-sources';
import { DataTable } from './data-table';

export function registerSource(source: DataSource);
export function registerSource(sourceName: string, source: DataSource);
export function registerSource(sourceOrName: DataSource | string, source?: DataSource) {
  const sourceName = source ? (sourceOrName as string) : 'source' + (DataSources.size() + 1);
  const sourceToRegister = source ?? (sourceOrName as DataSource);
  DataSources.register(sourceName, sourceToRegister);
}

export function getSource(): DataSource;
export function getSource(sourceName: string): DataSource;
export function getSource(sourceName?: string): DataSource {
  let source: DataSource;
  if (sourceName) {
    source = DataSources.get(sourceName);
    if (!source) {
      throw new Error(`No DataSource registered with the name "${sourceName}" !!`);
    }
  } else {
    const sources = DataSources.getAll();
    if (sources.length == 0) {
      throw new Error('No DataSources registered !!. Register a DataSource with the "registerSource" function');
    }
    source = sources[0];
  }
  return source;
}

export function getTable(tableName: string): DataTable;
export function getTable(sourceName: string, tableName: string): DataTable;
export function getTable(sourceOrTableName: string, tableName?: string): DataTable {
  const source: DataSource = tableName ? getSource(sourceOrTableName) : getSource();
  return source.getTable(tableName ?? sourceOrTableName);
}

export async function getConnection(): Promise<Connection>;
export async function getConnection(sourceName: string): Promise<Connection>;
export async function getConnection(sourceName?: string): Promise<Connection> {
  const source: DataSource = sourceName ? getSource(sourceName) : getSource();
  return await source.getConnection();
}