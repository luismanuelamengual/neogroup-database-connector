import { Field } from './fields'

export type BasicCondition = { field: Field; operator?: string; value: any }

export type RawCondition = string | { sql: string; bindings: Array<any> }

export enum ConditionConnector {
  AND,
  OR
}

export type Condition = RawCondition | BasicCondition | ConditionGroup | ((group: ConditionGroup) => void)

export type ConnectedCondition = { condition: Condition; connector: ConditionConnector }

export class ConditionGroup {
  private conditions: Array<ConnectedCondition> = []

  public setConditions(conditions: Array<ConnectedCondition>): ConditionGroup {
    this.conditions = conditions

    return this
  }

  public getConditions(): Array<{ condition: Condition; connector: ConditionConnector }> {
    return this.conditions
  }

  public where(callback: (group: ConditionGroup) => void): ConditionGroup
  public where(condition: Condition): ConditionGroup
  public where(field: Field, value: any): ConditionGroup
  public where(field: Field, operator: string, value: any): ConditionGroup
  public where(): ConditionGroup {
    let condition: Condition

    if (arguments.length === 1 && typeof arguments[0] === 'function') {
      const group = new ConditionGroup()

      arguments[0](group)
      condition = group
    } else {
      switch (arguments.length) {
        case 1:
          condition = arguments[0]
          break

        case 2: {
          const [field, value] = arguments

          condition = { field, operator: '=', value }
          break
        }

        case 3: {
          const [field, operator, value] = arguments

          condition = { field, operator, value }
          break
        }

        default:
          throw new Error('Wrong number of arguments for "where"')
      }
    }

    this.conditions.push({ condition, connector: ConditionConnector.AND })

    return this
  }

  public orWhere(callback: (group: ConditionGroup) => void): ConditionGroup
  public orWhere(condition: Condition): ConditionGroup
  public orWhere(field: Field, value: any): ConditionGroup
  public orWhere(field: Field, operator: string, value: any): ConditionGroup
  public orWhere(): ConditionGroup {
    let condition: Condition

    if (arguments.length === 1 && typeof arguments[0] === 'function') {
      const group = new ConditionGroup()

      arguments[0](group)
      condition = group
    } else {
      switch (arguments.length) {
        case 1:
          condition = arguments[0]
          break

        case 2: {
          const [field, value] = arguments

          condition = { field, operator: '=', value }
          break
        }

        case 3: {
          const [field, operator, value] = arguments

          condition = { field, operator, value }
          break
        }

        default:
          throw new Error('Wrong number of arguments for "orWhere"')
      }
    }

    this.conditions.push({ condition, connector: ConditionConnector.OR })

    return this
  }
}
