import { DataSet } from '../data-set'
import { DataSource } from '../data-source'
import { DB } from '../db'
import { Field, InsertQuery } from '../query'
import { Condition, ConditionGroup } from '../query/conditions'
import { OrderByDirection } from '../query/features/has-order-by-fields'
import {
  belongsTo as _belongsTo,
  hasMany as _hasMany,
  hasManyThrough as _hasManyThrough,
  hasOne as _hasOne,
  hasOneThrough as _hasOneThrough,
  Relationship
} from './relationship'
import { CastType } from './resource'
import { ResourceQuery } from './resource-query'

// ── Metadata registry ─────────────────────────────────────────────────────────
// Decorators run before the class decorator, storing per-prototype metadata.
// @Resource reads it all and injects everything onto the enhanced class.

interface ColumnMeta {
  name: string
  cast?: CastType
  primaryKey?: boolean
}

interface RelationshipMeta {
  name: string
  relationship: Relationship
}

interface PrototypeMeta {
  columns: ColumnMeta[]
  relationships: RelationshipMeta[]
}

const registry = new WeakMap<object, PrototypeMeta>()

function getOrCreate(proto: object): PrototypeMeta {
  if (!registry.has(proto)) {
    registry.set(proto, { columns: [], relationships: [] })
  }

  return registry.get(proto)!
}

// ── Cast helpers ──────────────────────────────────────────────────────────────

function applyCast(value: any, type: CastType): any {
  if (value == null) {
    return null
  }

  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === true || value === 1 || value === '1' || value === 'true'
    case 'string':
      return String(value)
    case 'json':
      return typeof value === 'string' ? JSON.parse(value) : value
    case 'date':
      return value instanceof Date ? value : new Date(value)
  }
}

function applyCastForStorage(value: any, type: CastType): any {
  if (value == null) {
    return null
  }

  switch (type) {
    case 'boolean':
      return value ? 1 : 0
    case 'json':
      return typeof value === 'string' ? value : JSON.stringify(value)
    case 'date':
      return value instanceof Date ? value.toISOString() : value
    default:
      return value
  }
}

// ── Property decorators ───────────────────────────────────────────────────────

export interface ColumnOptions {
  /** Automatic type coercion when reading from the database. */
  cast?: CastType
  /** Mark this column as the primary key. Equivalent to @PrimaryKey(). */
  primaryKey?: boolean
}

/** Map a class property to a database column. */
export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.columns.push({ name: String(propertyKey), ...options })
  }
}

/** Shorthand for @Column({ primaryKey: true }). */
export function PrimaryKey(): PropertyDecorator {
  return Column({ primaryKey: true })
}

/** One-to-one: this model's primary key appears as foreignKey on the related model. */
export function HasOne(related: () => any, foreignKey: string, localKey = 'id'): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({ name: String(propertyKey), relationship: _hasOne(related, foreignKey, localKey) })
  }
}

/** One-to-many: this model's primary key appears as foreignKey on the related model. */
export function HasMany(related: () => any, foreignKey: string, localKey = 'id'): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({ name: String(propertyKey), relationship: _hasMany(related, foreignKey, localKey) })
  }
}

/** Inverse of HasOne/HasMany: this model holds foreignKey that points to the related model. */
export function BelongsTo(related: () => any, foreignKey: string, localKey = 'id'): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({ name: String(propertyKey), relationship: _belongsTo(related, foreignKey, localKey) })
  }
}

/** Has-one through an intermediate model. */
export function HasOneThrough(
  related: () => any,
  through: () => any,
  foreignKey: string,
  throughForeignKey: string,
  localKey = 'id',
  throughLocalKey = 'id'
): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({
      name: String(propertyKey),
      relationship: _hasOneThrough(related, through, foreignKey, throughForeignKey, localKey, throughLocalKey)
    })
  }
}

/** Has-many through an intermediate model. */
export function HasManyThrough(
  related: () => any,
  through: () => any,
  foreignKey: string,
  throughForeignKey: string,
  localKey = 'id',
  throughLocalKey = 'id'
): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({
      name: String(propertyKey),
      relationship: _hasManyThrough(related, through, foreignKey, throughForeignKey, localKey, throughLocalKey)
    })
  }
}

// ── @Resource class decorator ─────────────────────────────────────────────────

export interface ResourceOptions {
  /** Database table name. Defaults to lowercase class name + 's'. */
  table?: string
  /** Primary key column name. Defaults to 'id'. */
  primaryKey?: string
  /** DataSource to use. Defaults to DB.getActiveSource(). */
  source?: DataSource | null
}

/**
 * Marks a class as an Active Record resource.
 * Injects static query methods (find, where, get, with, …) and instance
 * persistence methods (save, delete) — no base class required.
 */
export function Resource(options?: ResourceOptions) {
  return function <T extends { new (...args: any[]): {} }>(BaseClass: T) {
    // Read metadata accumulated by property decorators on BaseClass.prototype.
    // We read from the ORIGINAL name before the class is wrapped.
    const originalName = BaseClass.name
    const meta = registry.get(BaseClass.prototype) ?? { columns: [], relationships: [] }
    const tableName = options?.table ?? originalName.toLowerCase() + 's'
    const primaryKeyCol = meta.columns.find((c) => c.primaryKey)?.name ?? options?.primaryKey ?? 'id'
    const fieldNames = meta.columns.map((c) => c.name)
    const castsMap: Record<string, CastType> = {}

    meta.columns.forEach((c) => {
      if (c.cast) {
        castsMap[c.name] = c.cast
      }
    })
    const relsMap: Record<string, Relationship> = {}

    meta.relationships.forEach((r) => {
      relsMap[r.name] = r.relationship
    })
    const configuredSource = options?.source ?? null

    // ── Closures shared by static & instance injected methods ─────────────

    function resolveSource(): DataSource {
      return configuredSource ?? DB.getActiveSource()
    }

    function hydrateRow(row: Record<string, any>): any {
      const instance = new Enhanced() as any
      const cols = fieldNames.length > 0 ? fieldNames : Object.keys(row)

      for (const col of cols) {
        if (!(col in row)) {
          continue
        }

        const cast = castsMap[col]

        instance[col] = cast ? applyCast(row[col], cast) : row[col]
      }

      return instance
    }

    function buildQuery(): ResourceQuery<any> {
      return new ResourceQuery<any>(Enhanced as any, resolveSource().table(tableName))
    }

    // ── Enhanced class — wraps BaseClass and injects all methods ──────────

    class Enhanced extends BaseClass {
      // Static metadata (also used by ResourceQuery internals)
      static readonly table = tableName
      static readonly primaryKey = primaryKeyCol
      static readonly fields = fieldNames
      static readonly casts = castsMap
      static readonly relationships = relsMap
      static readonly source = configuredSource

      static fromRow(row: Record<string, any>): any {
        return hydrateRow(row)
      }

      // ── Static query methods ───────────────────────────────────────────

      static async find(id: any): Promise<any> {
        return buildQuery().find(id)
      }

      static async get(): Promise<any[]> {
        return buildQuery().get()
      }

      static async first(): Promise<any> {
        return buildQuery().first()
      }

      static where(callback: (group: ConditionGroup) => void): ResourceQuery<any>
      static where(condition: Condition): ResourceQuery<any>
      static where(field: Field, value: any): ResourceQuery<any>
      static where(field: Field, operator: string, value: any): ResourceQuery<any>
      static where(...args: any[]): ResourceQuery<any> {
        return (buildQuery() as any).where(...args)
      }

      static whereIn(field: Field, values: any[]): ResourceQuery<any> {
        return buildQuery().whereIn(field, values)
      }

      static whereNotIn(field: Field, values: any[]): ResourceQuery<any> {
        return buildQuery().whereNotIn(field, values)
      }

      static whereBetween(field: Field, range: [any, any]): ResourceQuery<any> {
        return buildQuery().whereBetween(field, range)
      }

      static whereNotBetween(field: Field, range: [any, any]): ResourceQuery<any> {
        return buildQuery().whereNotBetween(field, range)
      }

      static whereNull(field: Field): ResourceQuery<any> {
        return buildQuery().whereNull(field)
      }

      static whereNotNull(field: Field): ResourceQuery<any> {
        return buildQuery().whereNotNull(field)
      }

      static whereLike(field: Field, pattern: string): ResourceQuery<any> {
        return buildQuery().whereLike(field, pattern)
      }

      static whereNotLike(field: Field, pattern: string): ResourceQuery<any> {
        return buildQuery().whereNotLike(field, pattern)
      }

      static whereColumn(field: Field, column: Field): ResourceQuery<any>
      static whereColumn(field: Field, operator: string, column: Field): ResourceQuery<any>
      static whereColumn(...args: any[]): ResourceQuery<any> {
        return (buildQuery() as any).whereColumn(...args)
      }

      static orderBy(field: Field, direction?: OrderByDirection): ResourceQuery<any> {
        return buildQuery().orderBy(field, direction)
      }

      static limit(value: number): ResourceQuery<any> {
        return buildQuery().limit(value)
      }

      static offset(value: number): ResourceQuery<any> {
        return buildQuery().offset(value)
      }

      static select(...args: (Field | Field[])[]): ResourceQuery<any> {
        return (buildQuery() as any).select(...args)
      }

      static with(relations: string | string[], ...rest: string[]): ResourceQuery<any> {
        return buildQuery().with(relations, ...rest)
      }

      static joinRelationship(name: string): ResourceQuery<any> {
        return buildQuery().joinRelationship(name)
      }

      static innerJoinRelationship(name: string): ResourceQuery<any> {
        return buildQuery().innerJoinRelationship(name)
      }

      static leftJoinRelationship(name: string): ResourceQuery<any> {
        return buildQuery().leftJoinRelationship(name)
      }

      // ── Instance persistence methods ───────────────────────────────────

      async save(): Promise<void> {
        const self = this as any
        const pk = primaryKeyCol
        // Build the row to persist
        const row: DataSet = {}
        const cols = fieldNames.length > 0 ? fieldNames : Object.keys(self).filter((k) => typeof self[k] !== 'function')

        for (const col of cols) {
          const value = self[col]

          if (value === undefined) {
            continue
          }

          const cast = castsMap[col]

          row[col] = cast ? applyCastForStorage(value, cast) : value
        }

        if (self[pk] != null) {
          // UPDATE — exclude PK from SET clause
          const updateRow = { ...row }

          delete updateRow[pk]
          await resolveSource().table(tableName).where(pk, self[pk]).update(updateRow)
        } else {
          // INSERT — use explicit connection to read lastInsertId
          const conn = await resolveSource().getConnection()

          try {
            await conn.execute(new InsertQuery().setTable(tableName).setFields(row))
            self[pk] = await conn.lastInsertId()
          } finally {
            await conn.close()
          }
        }
      }

      async delete(): Promise<void> {
        const self = this as any
        const pkValue = self[primaryKeyCol]

        if (pkValue == null) {
          throw new Error('Cannot delete a resource without a primary key value.')
        }

        await resolveSource().table(tableName).where(primaryKeyCol, pkValue).delete()
      }
    }

    // Preserve the original class name so default table names and stack traces stay clean.
    Object.defineProperty(Enhanced, 'name', { value: originalName })

    return Enhanced as unknown as T
  }
}
