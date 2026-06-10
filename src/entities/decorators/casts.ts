import { CastType } from '../entity'

// ── Cast helpers ──────────────────────────────────────────────────────────────

export function applyCast(value: any, type: CastType): any {
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

export function applyCastForStorage(value: any, type: CastType): any {
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
