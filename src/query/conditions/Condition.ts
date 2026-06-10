import { BasicCondition } from './BasicCondition'
import { ColumnCondition } from './ColumnCondition'
import { ConditionGroup } from './ConditionGroup'
import { RawCondition } from './RawCondition'

export type Condition =
  | RawCondition
  | BasicCondition
  | ColumnCondition
  | ConditionGroup
  | ((group: ConditionGroup) => void)
