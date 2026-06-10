import { getOrCreate } from './metadata'

/** One-to-one: this model's primary key appears as foreignKey on the related model. */
export function HasOne(related: () => any, foreignKey: string, localKey = 'id'): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({ name: String(propertyKey), relationship: { type: 'hasOne', related, foreignKey, localKey } })
  }
}
