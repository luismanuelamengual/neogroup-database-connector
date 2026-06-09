import { DataSet } from '../data-set'
import { DataSource } from '../data-source'
import { DB } from '../db'
import { Field, InsertQuery } from '../query'
import { Condition, ConditionGroup } from '../query/conditions'
import { OrderByDirection } from '../query/features/has-order-by-fields'
import { Relationship } from './relationship'
import { ResourceQuery } from './resource-query'

export type CastType = 'number' | 'boolean' | 'string' | 'json' | 'date'

type ResourceCtor<T extends Resource> = (new () => T) & typeof Resource

/**
 * Base class for Eloquent-style Active Record resources.
 *
 * Usage:
 *   class User extends Resource {
 *     static table = 'users'
 *     static casts = { age: 'number', active: 'boolean' } as const
 *     static relationships = { orders: hasMany(() => Order, 'userId') }
 *   }
 *
 *   const users = await User.where('active', true).get()
 *   const user  = await User.find(1)
 *   user.name = 'Bob'
 *   await user.save()
 *   await user.delete()
 */
export class Resource {
  // ── Static configuration ─────────────────────────────────────────────────────

  /** DB table name (defaults to lowercase class name + 's') */
  static table: string

  /** Primary key column name */
  static primaryKey: string = 'id'

  /** Explicit list of DB columns. When empty, all columns from the row are mapped. */
  static fields: string[] = []

  /** Column → cast type mappings */
  static casts: Record<string, CastType> = {}

  /** Relationship definitions */
  static relationships: Record<string, Relationship> = {}

  /** Custom attribute getters (name → getter function). Applied after hydration. */
  static customAttributes: Record<string, (instance: Resource) => any> = {}

  /** DataSource to use (defaults to DB.getActiveSource()) */
  static source: DataSource | null = null

  // ── Internal helpers ─────────────────────────────────────────────────────────

  private static _getTable(this: typeof Resource): string {
    return this.table ?? this.name.toLowerCase() + 's'
  }

  private static _getSource(this: typeof Resource): DataSource {
    return this.source ?? DB.getActiveSource()
  }

  /** Hydrate a raw DB row into a Resource instance, applying casts. */
  static fromRow<T extends Resource>(this: ResourceCtor<T>, row: Record<string, any>): T {
    const instance = new this()
    const fieldsToMap = this.fields.length > 0 ? this.fields : Object.keys(row)

    for (const col of fieldsToMap) {
      if (!(col in row)) {
        continue
      }

      const raw = row[col]
      const castType = this.casts[col]

      ;(instance as any)[col] = castType ? Resource._cast(raw, castType) : raw
    }

    // Custom attributes
    for (const [attrName, getter] of Object.entries(this.customAttributes)) {
      Object.defineProperty(instance, attrName, {
        get: () => getter(instance),
        enumerable: true,
        configurable: true
      })
    }

    return instance
  }

  private static _cast(value: any, type: CastType): any {
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

  private static _castForStorage(value: any, type: CastType): any {
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

  // ── Static query factory ─────────────────────────────────────────────────────

  private static _query<T extends Resource>(this: ResourceCtor<T>): ResourceQuery<T> {
    const tableName = (this as typeof Resource)._getTable()
    const source = (this as typeof Resource)._getSource()
    const dataTable = source.table(tableName)

    return new ResourceQuery<T>(this, dataTable)
  }

  /** Find a resource by primary key. Returns null if not found. */
  public static async find<T extends Resource>(this: ResourceCtor<T>, id: any): Promise<T | null> {
    return this._query().find(id)
  }

  /** Start a query with a where clause. */
  public static where<T extends Resource>(
    this: ResourceCtor<T>,
    callback: (group: ConditionGroup) => void
  ): ResourceQuery<T>
  public static where<T extends Resource>(this: ResourceCtor<T>, condition: Condition): ResourceQuery<T>
  public static where<T extends Resource>(this: ResourceCtor<T>, field: Field, value: any): ResourceQuery<T>
  public static where<T extends Resource>(
    this: ResourceCtor<T>,
    field: Field,
    operator: string,
    value: any
  ): ResourceQuery<T>
  public static where<T extends Resource>(this: ResourceCtor<T>, ...args: any[]): ResourceQuery<T> {
    return (this._query() as any).where(...args)
  }

  public static whereIn<T extends Resource>(this: ResourceCtor<T>, field: Field, values: any[]): ResourceQuery<T> {
    return this._query().whereIn(field, values)
  }

  public static whereNotIn<T extends Resource>(this: ResourceCtor<T>, field: Field, values: any[]): ResourceQuery<T> {
    return this._query().whereNotIn(field, values)
  }

  public static whereBetween<T extends Resource>(
    this: ResourceCtor<T>,
    field: Field,
    range: [any, any]
  ): ResourceQuery<T> {
    return this._query().whereBetween(field, range)
  }

  public static whereNotBetween<T extends Resource>(
    this: ResourceCtor<T>,
    field: Field,
    range: [any, any]
  ): ResourceQuery<T> {
    return this._query().whereNotBetween(field, range)
  }

  public static whereNull<T extends Resource>(this: ResourceCtor<T>, field: Field): ResourceQuery<T> {
    return this._query().whereNull(field)
  }

  public static whereNotNull<T extends Resource>(this: ResourceCtor<T>, field: Field): ResourceQuery<T> {
    return this._query().whereNotNull(field)
  }

  public static whereLike<T extends Resource>(this: ResourceCtor<T>, field: Field, pattern: string): ResourceQuery<T> {
    return this._query().whereLike(field, pattern)
  }

  public static whereColumn<T extends Resource>(this: ResourceCtor<T>, field: Field, column: Field): ResourceQuery<T>
  public static whereColumn<T extends Resource>(
    this: ResourceCtor<T>,
    field: Field,
    operator: string,
    column: Field
  ): ResourceQuery<T>
  public static whereColumn<T extends Resource>(this: ResourceCtor<T>, ...args: any[]): ResourceQuery<T> {
    return (this._query() as any).whereColumn(...args)
  }

  public static orderBy<T extends Resource>(
    this: ResourceCtor<T>,
    field: Field,
    direction?: OrderByDirection
  ): ResourceQuery<T> {
    return this._query().orderBy(field, direction)
  }

  public static limit<T extends Resource>(this: ResourceCtor<T>, value: number): ResourceQuery<T> {
    return this._query().limit(value)
  }

  public static offset<T extends Resource>(this: ResourceCtor<T>, value: number): ResourceQuery<T> {
    return this._query().offset(value)
  }

  public static select<T extends Resource>(this: ResourceCtor<T>, ...fields: (Field | Field[])[]): ResourceQuery<T> {
    return (this._query() as any).select(...fields)
  }

  /** Eager-load relations. */
  public static with<T extends Resource>(
    this: ResourceCtor<T>,
    relations: string | string[],
    ...rest: string[]
  ): ResourceQuery<T> {
    return this._query().with(relations, ...rest)
  }

  /** Join a relationship. */
  public static joinRelationship<T extends Resource>(this: ResourceCtor<T>, relationName: string): ResourceQuery<T> {
    return this._query().joinRelationship(relationName)
  }

  public static innerJoinRelationship<T extends Resource>(
    this: ResourceCtor<T>,
    relationName: string
  ): ResourceQuery<T> {
    return this._query().innerJoinRelationship(relationName)
  }

  public static leftJoinRelationship<T extends Resource>(
    this: ResourceCtor<T>,
    relationName: string
  ): ResourceQuery<T> {
    return this._query().leftJoinRelationship(relationName)
  }

  /** Fetch all records. */
  public static async get<T extends Resource>(this: ResourceCtor<T>): Promise<T[]> {
    return this._query().get()
  }

  /** Fetch the first record, or null. */
  public static async first<T extends Resource>(this: ResourceCtor<T>): Promise<T | null> {
    return this._query().first()
  }

  // ── Instance methods ─────────────────────────────────────────────────────────

  /**
   * Persist the resource.
   * - If the primary key is set → UPDATE
   * - Otherwise → INSERT and set the primary key from lastInsertId
   */
  public async save(): Promise<void> {
    const cls = this.constructor as typeof Resource
    const pk = cls.primaryKey
    const tableName = cls._getTable()
    const source = cls._getSource()
    const row = this._toDataSet(cls)
    const isUpdate = (this as any)[pk] != null

    if (isUpdate) {
      delete row[pk] // don't include PK in SET clause
      await source
        .table(tableName)
        .where(pk, (this as any)[pk])
        .update(row)
    } else {
      const conn = await source.getConnection()

      try {
        const insertQuery = new InsertQuery().setTable(tableName).setFields(row)

        await conn.execute(insertQuery)
        ;(this as any)[pk] = await conn.lastInsertId()
      } finally {
        await conn.close()
      }
    }
  }

  /** Delete the resource from the database. */
  public async delete(): Promise<void> {
    const cls = this.constructor as typeof Resource
    const pk = cls.primaryKey
    const pkValue = (this as any)[pk]

    if (pkValue == null) {
      throw new Error('Cannot delete a resource without a primary key value.')
    }

    await cls._getSource().table(cls._getTable()).where(pk, pkValue).delete()
  }

  /** Convert instance to a plain DataSet object, applying storage casts. */
  private _toDataSet(cls: typeof Resource): DataSet {
    const row: DataSet = {}
    const fieldsToMap = cls.fields.length > 0 ? cls.fields : Object.keys(this as any)

    for (const col of fieldsToMap) {
      const value = (this as any)[col]

      if (value === undefined) {
        continue
      }

      const castType = cls.casts[col]

      row[col] = castType ? Resource._castForStorage(value, castType) : value
    }

    return row
  }
}
