import { BaseEntity } from './BaseEntity'

/**
 * Plain-object (DTO) type of an entity.
 *
 * - For entities that extend BaseEntity: strips all methods and BaseEntity-inherited
 *   members (save, delete, toDto, …), keeping only data properties and getters.
 *   Nested entities and arrays of entities are mapped recursively.
 *
 * - For plain entities (no BaseEntity): the entity class is its own DTO, so
 *   Dto<Country> resolves to Country itself.
 *
 * Usage:
 *   export type UserDto = Dto<User>      // strips BaseEntity overhead
 *   export type CountryDto = Dto<Country> // = Country (plain entity)
 */
export type Dto<T> = T extends BaseEntity
  ? {
      -readonly [K in keyof T as K extends keyof BaseEntity
        ? never
        : T[K] extends (...args: any[]) => any
        ? never
        : K]: DtoValue<T[K]>
    }
  : T

type DtoValue<V> = V extends BaseEntity
  ? Dto<V>
  : V extends Array<infer E>
  ? E extends BaseEntity
    ? Array<Dto<E>>
    : V
  : V
