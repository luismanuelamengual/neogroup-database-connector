import {ConditionGroup} from './condition-group';
import {Statement} from '../statement';
import {Field} from '../fields';

export type Condition = string | Statement | ConditionGroup | {field: Field, operator: string, value: any};