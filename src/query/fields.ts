import { Table } from './table'

export type RawField = string

export type BasicField = { name: string; table?: Table }

export type Field = RawField | BasicField

/**
 * Converts a string field (optionally 'table.field') into a BasicField object
 * so engine-specific quoting is applied by the query builder.
 */
export function toField(f: Field): BasicField {
  if (typeof f !== 'string') {
    return f as BasicField
  }

  const dot = (f as string).indexOf('.')

  return dot !== -1
    ? { table: (f as string).substring(0, dot), name: (f as string).substring(dot + 1) }
    : { name: f as string }
}
