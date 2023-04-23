import { Table } from './table';

export type RawField = string;

export type BasicField = {name: string, table?: Table};

export type Field = RawField | BasicField;
