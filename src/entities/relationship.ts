import { RelationshipType } from './RelationshipType'

export interface Relationship {
  type: RelationshipType
  related: () => any
  foreignKey: string
  localKey: string
  through?: () => any
  throughForeignKey?: string
  throughLocalKey?: string
}
