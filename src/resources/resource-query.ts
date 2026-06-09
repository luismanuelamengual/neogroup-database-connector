import { DataTable } from '../data-table'
import { Field } from '../query'
import { Condition, ConditionGroup } from '../query/conditions'
import { JoinType } from '../query/features/has-joins'
import { OrderByDirection } from '../query/features/has-order-by-fields'
import { Relationship } from './relationship'

type ResourceClass<T> = (new () => T) & {
  table: string
  primaryKey: string
  relationships: Record<string, Relationship>
  fromRow(row: Record<string, any>): T
}

/**
 * Chainable query builder for Resources. Wraps DataTable and hydrates rows
 * into typed Resource instances when a terminal method is called.
 */
export class ResourceQuery<T> {
  private _resourceClass: ResourceClass<T>
  private _table: DataTable
  private _withs: string[] = []

  constructor(resourceClass: ResourceClass<T>, table: DataTable) {
    this._resourceClass = resourceClass
    this._table = table
  }

  // ── Eager loading ────────────────────────────────────────────────────────────

  public with(relations: string | string[], ...rest: string[]): this {
    const toAdd = Array.isArray(relations) ? relations : [relations, ...rest]

    this._withs.push(...toAdd)

    return this
  }

  // ── Join relationships ───────────────────────────────────────────────────────

  public joinRelationship(relationName: string): this {
    return this._applyJoin(JoinType.INNER_JOIN, relationName)
  }

  public innerJoinRelationship(relationName: string): this {
    return this._applyJoin(JoinType.INNER_JOIN, relationName)
  }

  public leftJoinRelationship(relationName: string): this {
    return this._applyJoin(JoinType.LEFT_JOIN, relationName)
  }

  private _applyJoin(joinType: JoinType, relationName: string): this {
    const rel = this._resourceClass.relationships[relationName]

    if (!rel) {
      throw new Error(`Relationship "${relationName}" is not defined on ${this._resourceClass.name}`)
    }

    const RelatedClass = rel.related()
    const relatedTable: string = RelatedClass.table

    if (rel.type === 'hasOne' || rel.type === 'hasMany') {
      // local table.localKey = related table.foreignKey
      const sourceField = `${this._resourceClass.table}.${rel.localKey}`
      const remoteField = `${relatedTable}.${rel.foreignKey}`

      this._table.join(joinType, relatedTable, sourceField, remoteField)
    } else if (rel.type === 'belongsTo') {
      // local table.foreignKey = related table.localKey
      const sourceField = `${this._resourceClass.table}.${rel.foreignKey}`
      const remoteField = `${relatedTable}.${rel.localKey}`

      this._table.join(joinType, relatedTable, sourceField, remoteField)
    } else if (rel.type === 'hasOneThrough' || rel.type === 'hasManyThrough') {
      // local → through → related
      const ThroughClass = rel.through!()
      const throughTable: string = ThroughClass.table

      this._table.join(
        joinType,
        throughTable,
        `${this._resourceClass.table}.${rel.localKey}`,
        `${throughTable}.${rel.throughForeignKey}`
      )
      this._table.join(
        joinType,
        relatedTable,
        `${throughTable}.${rel.throughLocalKey}`,
        `${relatedTable}.${rel.foreignKey}`
      )
    }

    return this
  }

  // ── Terminal methods ─────────────────────────────────────────────────────────

  public async get(): Promise<T[]> {
    const rows = await this._table.get()
    const resources = rows.map((row) => this._resourceClass.fromRow(row))

    if (this._withs.length > 0) {
      await this._loadRelations(resources as any[], this._withs, this._resourceClass)
    }

    return resources
  }

  public async first(): Promise<T | null> {
    const row = await this._table.first()

    if (!row) {
      return null
    }

    const resource = this._resourceClass.fromRow(row)

    if (this._withs.length > 0) {
      await this._loadRelations([resource as any], this._withs, this._resourceClass)
    }

    return resource
  }

  public async find(id: any): Promise<T | null> {
    const row = await this._table.where(this._resourceClass.primaryKey, id).first()

    if (!row) {
      return null
    }

    const resource = this._resourceClass.fromRow(row)

    if (this._withs.length > 0) {
      await this._loadRelations([resource as any], this._withs, this._resourceClass)
    }

    return resource
  }

  // ── Eager-load implementation ────────────────────────────────────────────────

  private async _loadRelations(resources: any[], relations: string[], ParentClass: ResourceClass<any>): Promise<void> {
    // Group by top-level relation name; accumulate nested paths
    const groups = new Map<string, string[]>()

    for (const path of relations) {
      const dot = path.indexOf('.')
      const head = dot === -1 ? path : path.substring(0, dot)
      const tail = dot === -1 ? null : path.substring(dot + 1)

      if (!groups.has(head)) {
        groups.set(head, [])
      }

      if (tail) {
        groups.get(head)!.push(tail)
      }
    }

    for (const [head, nested] of groups) {
      const rel = ParentClass.relationships[head]

      if (!rel) {
        continue
      }

      const RelatedClass = rel.related()
      let relatedItems: any[] = []

      if (rel.type === 'hasOne' || rel.type === 'hasMany') {
        const keys = [...new Set(resources.map((r) => r[rel.localKey]).filter((v) => v != null))]

        if (keys.length === 0) {
          continue
        }

        relatedItems = await RelatedClass.whereIn(rel.foreignKey, keys).get()

        // Build lookup: foreignKeyValue → items[]
        const lookup = new Map<any, any[]>()

        relatedItems.forEach((item: any) => {
          const k = item[rel.foreignKey]

          if (!lookup.has(k)) {
            lookup.set(k, [])
          }

          lookup.get(k)!.push(item)
        })

        resources.forEach((r) => {
          const matched = lookup.get(r[rel.localKey]) ?? []

          r[head] = rel.type === 'hasOne' ? matched[0] ?? null : matched
        })
      } else if (rel.type === 'belongsTo') {
        const keys = [...new Set(resources.map((r) => r[rel.foreignKey]).filter((v) => v != null))]

        if (keys.length === 0) {
          continue
        }

        relatedItems = await RelatedClass.whereIn(rel.localKey, keys).get()

        // Build lookup: localKeyValue → item
        const lookup = new Map<any, any>()

        relatedItems.forEach((item: any) => lookup.set(item[rel.localKey], item))

        resources.forEach((r) => {
          r[head] = lookup.get(r[rel.foreignKey]) ?? null
        })
      } else if (rel.type === 'hasOneThrough' || rel.type === 'hasManyThrough') {
        const ThroughClass = rel.through!()
        const localKeys = [...new Set(resources.map((r) => r[rel.localKey]).filter((v) => v != null))]

        if (localKeys.length === 0) {
          continue
        }

        // Load through intermediates
        const throughItems = await ThroughClass.whereIn(rel.throughForeignKey, localKeys).get()
        const throughKeys = [
          ...new Set(throughItems.map((t: any) => t[rel.throughLocalKey!]).filter((v: any) => v != null))
        ]

        if (throughKeys.length === 0) {
          continue
        }

        // Map parent localKey → through items
        const throughByParent = new Map<any, any[]>()

        throughItems.forEach((t: any) => {
          const k = t[rel.throughForeignKey!]

          if (!throughByParent.has(k)) {
            throughByParent.set(k, [])
          }

          throughByParent.get(k)!.push(t)
        })

        relatedItems = await RelatedClass.whereIn(rel.foreignKey, throughKeys).get()

        // Map through localKey → related items
        const relatedByThrough = new Map<any, any[]>()

        relatedItems.forEach((item: any) => {
          const k = item[rel.foreignKey]

          if (!relatedByThrough.has(k)) {
            relatedByThrough.set(k, [])
          }

          relatedByThrough.get(k)!.push(item)
        })

        resources.forEach((r) => {
          const throughs = throughByParent.get(r[rel.localKey]) ?? []
          const matched: any[] = []

          throughs.forEach((t: any) => {
            const items = relatedByThrough.get(t[rel.throughLocalKey!]) ?? []

            matched.push(...items)
          })
          r[head] = rel.type === 'hasOneThrough' ? matched[0] ?? null : matched
        })
      }

      // Recurse for nested dot-notation paths
      if (nested.length > 0 && relatedItems.length > 0) {
        await this._loadRelations(relatedItems, nested, RelatedClass)
      }
    }
  }

  // ── DataTable method proxies ─────────────────────────────────────────────────
  // (returning `this` so the query stays ResourceQuery-typed)

  public where(callback: (group: ConditionGroup) => void): this
  public where(condition: Condition): this
  public where(field: Field, value: any): this
  public where(field: Field, operator: string, value: any): this
  public where(...args: any[]): this {
    ;(this._table as any).where(...args)

    return this
  }

  public whereIn(field: Field, values: any[]): this {
    this._table.whereIn(field, values)

    return this
  }

  public whereNotIn(field: Field, values: any[]): this {
    this._table.whereNotIn(field, values)

    return this
  }

  public whereBetween(field: Field, range: [any, any]): this {
    this._table.whereBetween(field, range)

    return this
  }

  public whereNotBetween(field: Field, range: [any, any]): this {
    this._table.whereNotBetween(field, range)

    return this
  }

  public whereNull(field: Field): this {
    this._table.whereNull(field)

    return this
  }

  public whereNotNull(field: Field): this {
    this._table.whereNotNull(field)

    return this
  }

  public whereLike(field: Field, pattern: string): this {
    this._table.whereLike(field, pattern)

    return this
  }

  public whereNotLike(field: Field, pattern: string): this {
    this._table.whereNotLike(field, pattern)

    return this
  }

  public whereColumn(field: Field, column: Field): this
  public whereColumn(field: Field, operator: string, column: Field): this
  public whereColumn(...args: any[]): this {
    ;(this._table as any).whereColumn(...args)

    return this
  }

  public orWhere(...args: any[]): this {
    ;(this._table as any).orWhere(...args)

    return this
  }

  public orWhereIn(field: Field, values: any[]): this {
    this._table.orWhereIn(field, values)

    return this
  }

  public orWhereNotIn(field: Field, values: any[]): this {
    this._table.orWhereNotIn(field, values)

    return this
  }

  public orWhereBetween(field: Field, range: [any, any]): this {
    this._table.orWhereBetween(field, range)

    return this
  }

  public orWhereNotBetween(field: Field, range: [any, any]): this {
    this._table.orWhereNotBetween(field, range)

    return this
  }

  public orWhereNull(field: Field): this {
    this._table.orWhereNull(field)

    return this
  }

  public orWhereNotNull(field: Field): this {
    this._table.orWhereNotNull(field)

    return this
  }

  public orWhereLike(field: Field, pattern: string): this {
    this._table.orWhereLike(field, pattern)

    return this
  }

  public orWhereNotLike(field: Field, pattern: string): this {
    this._table.orWhereNotLike(field, pattern)

    return this
  }

  public select(...fields: (Field | Field[])[]): this {
    ;(this._table as any).select(...fields)

    return this
  }

  public orderBy(field: Field, direction?: OrderByDirection): this {
    this._table.orderBy(field, direction as any)

    return this
  }

  public groupBy(...fields: Field[]): this {
    ;(this._table as any).groupBy(...fields)

    return this
  }

  public limit(value: number): this {
    this._table.setLimit(value)

    return this
  }

  public offset(value: number): this {
    this._table.setOffset(value)

    return this
  }

  public distinct(): this {
    this._table.setDistinct(true)

    return this
  }
}
