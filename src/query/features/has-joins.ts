import { ConditionGroup } from '../conditions'
import { BasicField, Field } from '../fields'
import { Table } from '../table'

/** Converts a 'table.field' string into a BasicField object so engine-specific
 *  quoting is applied correctly by the query builder. */
function toField(f: Field): BasicField {
  if (typeof f !== 'string') {
    return f as BasicField
  }

  const dot = (f as string).indexOf('.')

  return dot !== -1
    ? { table: (f as string).substring(0, dot), name: (f as string).substring(dot + 1) }
    : { name: f as string }
}

export enum JoinType {
  JOIN,
  INNER_JOIN,
  OUTER_JOIN,
  LEFT_JOIN,
  RIGHT_JOIN,
  CROSS_JOIN
}

export type Join = { table: Table; type: JoinType; condition: ConditionGroup; alias?: string }

export abstract class HasJoins<R> {
  protected _joins?: Array<Join>

  public getJoins(): Array<Join> {
    if (!this._joins) {
      this._joins = []
    }

    return this._joins
  }

  public setJoins(joins: Array<Join> | undefined): R {
    this._joins = joins

    return this as unknown as R
  }

  public join(join: Join): R
  public join(type: JoinType, table: Table, sourceField: Field, remoteField: Field): R
  public join(type: JoinType, table: Table, sourceField: Field, remoteField: Field, alias: string): R
  public join(type: JoinType, table: Table, sourceField?: Field, remoteField?: Field, alias?: string): R
  public join(): R {
    let join: Join

    if (arguments.length === 1) {
      join = arguments[0]
    } else {
      const [type, table, sourceField, remoteField, alias] = arguments
      const condition = new ConditionGroup()

      condition.where(toField(sourceField), toField(remoteField))
      join = { type, table, condition, alias }
    }

    this.getJoins().push(join)

    return this as unknown as R
  }

  public innerJoin(table: Table, sourceField: Field, remoteField: Field): R
  public innerJoin(table: Table, sourceField: Field, remoteField: Field, alias: string): R
  public innerJoin(table: Table, sourceField?: Field, remoteField?: Field, alias?: string): R
  public innerJoin(): R {
    // @ts-ignore
    this.join(JoinType.INNER_JOIN, ...arguments)

    return this as unknown as R
  }

  public leftJoin(table: Table, sourceField: Field, remoteField: Field): R
  public leftJoin(table: Table, sourceField: Field, remoteField: Field, alias: string): R
  public leftJoin(table: Table, sourceField?: Field, remoteField?: Field, alias?: string): R
  public leftJoin(): R {
    // @ts-ignore
    this.join(JoinType.LEFT_JOIN, ...arguments)

    return this as unknown as R
  }

  public rightJoin(table: Table, sourceField: Field, remoteField: Field): R
  public rightJoin(table: Table, sourceField: Field, remoteField: Field, alias: string): R
  public rightJoin(table: Table, sourceField?: Field, remoteField?: Field, alias?: string): R
  public rightJoin(): R {
    // @ts-ignore
    this.join(JoinType.RIGHT_JOIN, ...arguments)

    return this as unknown as R
  }

  public outerJoin(table: Table, sourceField: Field, remoteField: Field): R
  public outerJoin(table: Table, sourceField: Field, remoteField: Field, alias: string): R
  public outerJoin(table: Table, sourceField?: Field, remoteField?: Field, alias?: string): R
  public outerJoin(): R {
    // @ts-ignore
    this.join(JoinType.OUTER_JOIN, ...arguments)

    return this as unknown as R
  }

  public crossJoin(table: Table, sourceField: Field, remoteField: Field): R
  public crossJoin(table: Table, sourceField: Field, remoteField: Field, alias: string): R
  public crossJoin(table: Table, sourceField?: Field, remoteField?: Field, alias?: string): R
  public crossJoin(): R {
    // @ts-ignore
    this.join(JoinType.CROSS_JOIN, ...arguments)

    return this as unknown as R
  }
}
