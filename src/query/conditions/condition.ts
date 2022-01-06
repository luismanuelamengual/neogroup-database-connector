import {ConditionGroup} from './condition-group';
import {Statement} from '../statement';
import {ConditionType} from './condition-type';

export type Condition = string | Statement | ConditionGroup | {type: ConditionType, parameters?: { [key: string]: any; }};