type RawTable = string

type BasicTable = { name?: string; schema?: string }

export type QueryTable = RawTable | BasicTable
