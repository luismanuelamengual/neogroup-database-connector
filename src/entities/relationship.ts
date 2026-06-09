export type RelationshipType = 'hasOne' | 'hasMany' | 'belongsTo' | 'hasOneThrough' | 'hasManyThrough'

export interface Relationship {
  type: RelationshipType
  related: () => any // () => typeof Resource — lazy to avoid circular dep
  foreignKey: string
  localKey: string
  through?: () => any // For through relationships
  throughForeignKey?: string
  throughLocalKey?: string
}

export function hasOne(related: () => any, foreignKey: string, localKey: string = 'id'): Relationship {
  return { type: 'hasOne', related, foreignKey, localKey }
}

export function hasMany(related: () => any, foreignKey: string, localKey: string = 'id'): Relationship {
  return { type: 'hasMany', related, foreignKey, localKey }
}

export function belongsTo(related: () => any, foreignKey: string, localKey: string = 'id'): Relationship {
  return { type: 'belongsTo', related, foreignKey, localKey }
}

export function hasOneThrough(
  related: () => any,
  through: () => any,
  foreignKey: string,
  throughForeignKey: string,
  localKey: string = 'id',
  throughLocalKey: string = 'id'
): Relationship {
  return { type: 'hasOneThrough', related, through, foreignKey, localKey, throughForeignKey, throughLocalKey }
}

export function hasManyThrough(
  related: () => any,
  through: () => any,
  foreignKey: string,
  throughForeignKey: string,
  localKey: string = 'id',
  throughLocalKey: string = 'id'
): Relationship {
  return { type: 'hasManyThrough', related, through, foreignKey, localKey, throughForeignKey, throughLocalKey }
}
