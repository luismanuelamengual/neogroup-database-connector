import {ConditionGroup} from './condition-group';
import {Field} from '../fields';

export type Condition = string | ConditionGroup | {field?: Field, operator?: string, value?: any, sql?: string, bindings?: Array<any>};