import { DataTable } from '../database/DataTable'
import { Field } from '../database/query'
import { Condition, ConditionGroup } from '../database/query/conditions'
import { JoinType } from '../database/query/features/HasJoins'
import { OrderByDirection } from '../database/query/features/HasOrderByFields'
import { Relationship } from './Relationship'

type EntityClass<T> = (new () => T) & {
  table: string
  primaryKey: string
  columnsMap: Record<string, string>
  relationships: Record<string, Relationship>
  fromRow(row: Record<string, any>): T
}

/**
 * Chainable query builder for Entities. Wraps DataTable and hydrates rows
 * into typed Entity instances when a terminal method is called.
 */
export class EntityQuery<T> {
  private _entityClass: EntityClass<T>
  private _table: DataTable
  private _withs: string[] = []

  constructor(entityClass: EntityClass<T>, table: DataTable) {
    this._entityClass = entityClass
    this._table = table
  }

  // ── Conditional clauses ──────────────────────────────────────────────────────

  public when(condition: boolean, callback: (query: this) => void): this {
    if (condition) {
      callback(this)
    }

    return this
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
    const rel = this._entityClass.relationships[relationName]

    if (!rel) {
      throw new Error(`Relationship "${relationName}" is not defined on ${this._entityClass.name}`)
    }

    const RelatedClass = rel.related()
    const relatedTable: string = RelatedClass.table

    if (rel.type === 'hasOne' || rel.type === 'hasMany') {
      // local table.localKey = related table.foreignKey
      const sourceField = `${this._entityClass.table}.${rel.localKey}`
      const remoteField = `${relatedTable}.${rel.foreignKey}`

      this._table.join(joinType, relatedTable, sourceField, remoteField)
    } else if (rel.type === 'belongsTo') {
      // local table.foreignKey = related table.localKey
      const sourceField = `${this._entityClass.table}.${rel.foreignKey}`
      const remoteField = `${relatedTable}.${rel.localKey}`

      this._table.join(joinType, relatedTable, sourceField, remoteField)
    } else if (rel.type === 'hasOneThrough' || rel.type === 'hasManyThrough') {
      // local → through → related
      const ThroughClass = rel.through!()
      const throughTable: string = ThroughClass.table

      this._table.join(
        joinType,
        throughTable,
        `${this._entityClass.table}.${rel.localKey}`,
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
    const entities = rows.map((row) => this._entityClass.fromRow(row))

    if (this._withs.length > 0) {
      await this._loadRelations(entities as any[], this._withs, this._entityClass)
    }

    return entities
  }

  public async first(): Promise<T | null> {
    const row = await this._table.first()

    if (!row) {
      return null
    }

    const entity = this._entityClass.fromRow(row)

    if (this._withs.length > 0) {
      await this._loadRelations([entity as any], this._withs, this._entityClass)
    }

    return entity
  }

  public async find(id: any): Promise<T | null> {
    const row = await this._table.where(this._entityClass.primaryKey, id).first()

    if (!row) {
      return null
    }

    const entity = this._entityClass.fromRow(row)

    if (this._withs.length > 0) {
      await this._loadRelations([entity as any], this._withs, this._entityClass)
    }

    return entity
  }

  // ── Eager-load implementation ────────────────────────────────────────────────

  private async _loadRelations(entities: any[], relations: string[], ParentClass: EntityClass<any>): Promise<void> {
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
        const keys = [...new Set(entities.map((r) => r[rel.localKey]).filter((v) => v != null))]

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

        entities.forEach((r) => {
          const matched = lookup.get(r[rel.localKey]) ?? []

          r[head] = rel.type === 'hasOne' ? matched[0] ?? null : matched
        })
      } else if (rel.type === 'belongsTo') {
        const keys = [...new Set(entities.map((r) => r[rel.foreignKey]).filter((v) => v != null))]

        if (keys.length === 0) {
          continue
        }

        relatedItems = await RelatedClass.whereIn(rel.localKey, keys).get()

        // Build lookup: localKeyValue → item
        const lookup = new Map<any, any>()

        relatedItems.forEach((item: any) => lookup.set(item[rel.localKey], item))

        entities.forEach((r) => {
          r[head] = lookup.get(r[rel.foreignKey]) ?? null
        })
      } else if (rel.type === 'hasOneThrough' || rel.type === 'hasManyThrough') {
        const ThroughClass = rel.through!()
        const localKeys = [...new Set(entities.map((r) => r[rel.localKey]).filter((v) => v != null))]

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

        entities.forEach((r) => {
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

  // ── Field-name resolution ────────────────────────────────────────────────────
  // Query methods accept either entity property names ("firstName") or database
  // column names ("first_name"). If the field matches a registered property of
  // the entity, it is mapped to its database column; otherwise it passes through
  // untouched.

  private _resolveFieldName(name: string): string {
    const columnsMap = this._entityClass.columnsMap ?? {}

    return columnsMap[name] ?? name
  }

  private _resolveField<F extends Field>(field: F): F {
    if (typeof field === 'string') {
      const dot = field.lastIndexOf('.')

      if (dot === -1) {
        return this._resolveFieldName(field) as F
      }

      // "table.field" — only resolve fields qualified with this entity's table
      const tablePart = field.substring(0, dot)

      if (tablePart !== this._entityClass.table) {
        return field
      }

      return `${tablePart}.${this._resolveFieldName(field.substring(dot + 1))}` as F
    }

    if (field && typeof field === 'object' && typeof (field as any).name === 'string') {
      const table = (field as any).table
      const tableName = typeof table === 'string' ? table : table?.name

      if (tableName != null && tableName !== this._entityClass.table) {
        return field
      }

      return { ...(field as any), name: this._resolveFieldName((field as any).name) }
    }

    return field
  }

  /**
   * Resolves field names inside a Condition: basic/column conditions get their
   * fields mapped, condition groups are resolved recursively (in-place), and
   * callbacks are wrapped so the resulting group is resolved after it runs.
   * Raw conditions pass through untouched.
   */
  private _resolveCondition(condition: any): any {
    if (typeof condition === 'function') {
      return (group: ConditionGroup) => {
        condition(group)
        this._resolveConditionGroup(group)
      }
    }

    if (condition instanceof ConditionGroup) {
      this._resolveConditionGroup(condition)

      return condition
    }

    if (condition && typeof condition === 'object' && 'field' in condition) {
      const resolved: any = { ...condition, field: this._resolveField(condition.field) }

      if ('column' in condition) {
        resolved.column = this._resolveField(condition.column)
      }

      return resolved
    }

    return condition
  }

  private _resolveConditionGroup(group: ConditionGroup): void {
    for (const entry of group.getConditions()) {
      entry.condition = this._resolveCondition(entry.condition)
    }
  }

  // ── DataTable method proxies ─────────────────────────────────────────────────
  // (returning `this` so the query stays EntityQuery-typed)

  public where(callback: (group: ConditionGroup) => void): this
  public where(condition: Condition): this
  public where(field: Field, value: any): this
  public where(field: Field, operator: string, value: any): this
  public where(...args: any[]): this {
    if (args.length >= 2) {
      args[0] = this._resolveField(args[0])
    } else if (args.length === 1) {
      args[0] = this._resolveCondition(args[0])
    }

    ;(this._table as any).where(...args)

    return this
  }

  public whereIn(field: Field, values: any[]): this {
    this._table.whereIn(this._resolveField(field), values)

    return this
  }

  public whereNotIn(field: Field, values: any[]): this {
    this._table.whereNotIn(this._resolveField(field), values)

    return this
  }

  public whereBetween(field: Field, range: [any, any]): this {
    this._table.whereBetween(this._resolveField(field), range)

    return this
  }

  public whereNotBetween(field: Field, range: [any, any]): this {
    this._table.whereNotBetween(this._resolveField(field), range)

    return this
  }

  public whereNull(field: Field): this {
    this._table.whereNull(this._resolveField(field))

    return this
  }

  public whereNotNull(field: Field): this {
    this._table.whereNotNull(this._resolveField(field))

    return this
  }

  public whereLike(field: Field, pattern: string): this {
    this._table.whereLike(this._resolveField(field), pattern)

    return this
  }

  public whereNotLike(field: Field, pattern: string): this {
    this._table.whereNotLike(this._resolveField(field), pattern)

    return this
  }

  public whereColumn(field: Field, column: Field): this
  public whereColumn(field: Field, operator: string, column: Field): this
  public whereColumn(...args: any[]): this {
    args[0] = this._resolveField(args[0])
    args[args.length - 1] = this._resolveField(args[args.length - 1])
    ;(this._table as any).whereColumn(...args)

    return this
  }

  public orWhere(...args: any[]): this {
    if (args.length >= 2) {
      args[0] = this._resolveField(args[0])
    } else if (args.length === 1) {
      args[0] = this._resolveCondition(args[0])
    }

    ;(this._table as any).orWhere(...args)

    return this
  }

  public orWhereIn(field: Field, values: any[]): this {
    this._table.orWhereIn(this._resolveField(field), values)

    return this
  }

  public orWhereNotIn(field: Field, values: any[]): this {
    this._table.orWhereNotIn(this._resolveField(field), values)

    return this
  }

  public orWhereBetween(field: Field, range: [any, any]): this {
    this._table.orWhereBetween(this._resolveField(field), range)

    return this
  }

  public orWhereNotBetween(field: Field, range: [any, any]): this {
    this._table.orWhereNotBetween(this._resolveField(field), range)

    return this
  }

  public orWhereNull(field: Field): this {
    this._table.orWhereNull(this._resolveField(field))

    return this
  }

  public orWhereNotNull(field: Field): this {
    this._table.orWhereNotNull(this._resolveField(field))

    return this
  }

  public orWhereLike(field: Field, pattern: string): this {
    this._table.orWhereLike(this._resolveField(field), pattern)

    return this
  }

  public orWhereNotLike(field: Field, pattern: string): this {
    this._table.orWhereNotLike(this._resolveField(field), pattern)

    return this
  }

  public select(...fields: (Field | Field[])[]): this {
    const resolved = fields.map((f) =>
      Array.isArray(f) ? f.map((inner) => this._resolveField(inner)) : this._resolveField(f)
    )

    ;(this._table as any).select(...resolved)

    return this
  }

  public orderBy(field: Field, direction?: OrderByDirection): this {
    this._table.orderBy(this._resolveField(field), direction as any)

    return this
  }

  public groupBy(...fields: Field[]): this {
    ;(this._table as any).groupBy(...fields.map((f) => this._resolveField(f)))

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
