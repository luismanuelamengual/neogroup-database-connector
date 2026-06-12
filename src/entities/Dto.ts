import { BaseEntity } from './BaseEntity'

/**
 * Plain-object (DTO) type of an entity: keeps data properties and getters,
 * strips every method and everything inherited from BaseEntity (save, delete, …).
 * Nested entities and arrays of entities (relationships) are mapped recursively,
 * preserving optional modifiers — an unloaded relation stays optional in the DTO.
 *
 * Usage:
 *   export type UserDto = Dto<User>   // { id: number; name: string; label: string }
 */
export type Dto<T extends BaseEntity> = {
  -readonly [K in keyof T as K extends keyof BaseEntity
    ? never
    : T[K] extends (...args: any[]) => any
    ? never
    : K]: DtoValue<T[K]>
}

type DtoValue<V> = V extends BaseEntity
  ? Dto<V>
  : V extends Array<infer E>
  ? E extends BaseEntity
    ? Array<Dto<E>>
    : V
  : V
