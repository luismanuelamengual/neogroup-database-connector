export type RawTable = string;

export type BasicTable = {name?: string, schema?: string};

export type Table = RawTable | BasicTable;