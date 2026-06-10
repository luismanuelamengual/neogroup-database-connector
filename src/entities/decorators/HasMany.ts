import { getOrCreate } from './metadata'

/** One-to-many: this model's primary key appears as foreignKey on the related model. */
export function HasMany(related: () => any, foreignKey: string, localKey = 'id'): PropertyDecorator {
  return (target, propertyKey) => {
    const m = getOrCreate(target as object)

    m.relationships.push({
      name: String(propertyKey),
      relationship: { type: 'hasMany', related, foreignKey, localKey }
    })
  }
}
