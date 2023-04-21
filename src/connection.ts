import { DataSet } from './data-set';

export interface Connection {
  query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>>;
  execute(sql: string, bindings?: Array<any>): Promise<number>;
  beginTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  close(): Promise<void>;
}
