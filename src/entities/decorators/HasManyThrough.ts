import { getOrCreate } from './metadata'

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
      relationship: {
        type: 'hasManyThrough',
        related,
        through,
        foreignKey,
        throughForeignKey,
        localKey,
        throughLocalKey
      }
    })
  }
}
