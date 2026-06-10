import { belongsTo as _belongsTo } from '../relationship'
import { getOrCreate } from './metadata'

/** Inverse of HasOne/HasMany: this model holds foreignKey that points to the related model. */
export function BelongsTo(related: () => any, foreignKey: string, localKey = 'id'): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({ name: String(propertyKey), relationship: _belongsTo(related, foreignKey, localKey) })
  }
}
