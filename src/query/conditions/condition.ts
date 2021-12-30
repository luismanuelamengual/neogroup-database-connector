import {ConditionGroup} from './condition-group';
import {Field} from '../fields';

export type Condition = string | ConditionGroup | {operand1: Field | any, operator?: string, operand2?: Field | any};