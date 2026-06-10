import { getOrCreate } from './metadata'

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
      relationship: {
        type: 'hasOneThrough',
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
