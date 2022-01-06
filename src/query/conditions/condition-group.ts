import {Field} from '../fields';
import {Condition} from './condition';
import {ConditionConnector} from './condition-connector';
import {ConditionType} from './condition-type';

export class ConditionGroup {

    private conditions: Array<{condition: Condition, connector: ConditionConnector}> = [];

    public setConditions(conditions: Array<{condition: Condition, connector: ConditionConnector}>): ConditionGroup {
        this.conditions = conditions;
        return this;
    }

    public getConditions(): Array<{condition: Condition, connector: ConditionConnector}> {
        return this.conditions;
    }

    public addCondition(condition: Condition, connector: ConditionConnector = ConditionConnector.AND): ConditionGroup {
        this.conditions.push({condition, connector});
        return this;
    }

    public clearConditions(): ConditionGroup {
        this.conditions = [];
        return this;
    }

    public on(condition: Condition): ConditionGroup {
        return this.addCondition(condition);
    }

    public and(condition: Condition): ConditionGroup {
        return this.addCondition(condition);
    }

    public or(condition: Condition): ConditionGroup {
        return this.addCondition(condition, ConditionConnector.OR);
    }

    public equals(field: Field, value: any): ConditionGroup {
        return this.addCondition({type: ConditionType.EQUAL, parameters: {field, value}});
    }

    public orEquals(field: Field, value: any): ConditionGroup {
        return this.addCondition({type: ConditionType.EQUAL, parameters: {field, value}}, ConditionConnector.OR);
    }

    public equalsField(field: Field, otherField: Field): ConditionGroup {
        return this.addCondition({type: ConditionType.EQUAL_FIELDS, parameters: {field, otherField}});
    }

    public orEqualsField(field: Field, otherField: Field): ConditionGroup {
        return this.addCondition({type: ConditionType.EQUAL_FIELDS, parameters: {field, otherField}}, ConditionConnector.OR);
    }

    public distinct(field: Field, value: any): ConditionGroup {
        return this.addCondition({type: ConditionType.DISTINCT, parameters: {field, value}});
    }

    public orDistinct(field: Field, value: any): ConditionGroup {
        return this.addCondition({type: ConditionType.DISTINCT, parameters: {field, value}}, ConditionConnector.OR);
    }

    public greaterThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.GREATER_THAN, parameters: {field, value}});
    }

    public orGreaterThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.GREATER_THAN, parameters: {field, value}}, ConditionConnector.OR);
    }

    public lessThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.LESS_THAN, parameters: {field, value}});
    }

    public orLessThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.LESS_THAN, parameters: {field, value}}, ConditionConnector.OR);
    }

    public greaterOrEqualsThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.GREATER_OR_EQUALS_THAN, parameters: {field, value}});
    }

    public orGreaterOrEqualsThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.GREATER_OR_EQUALS_THAN, parameters: {field, value}}, ConditionConnector.OR);
    }

    public lessOrEqualsThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.LESS_OR_EQUALS_THAN, parameters: {field, value}});
    }

    public orLessOrEqualsThan(field: Field, value: any): ConditionGroup  {
        return this.addCondition({type: ConditionType.LESS_OR_EQUALS_THAN, parameters: {field, value}}, ConditionConnector.OR);
    }

    public isNull(field: Field): ConditionGroup {
        return this.addCondition({type: ConditionType.NULL, parameters: {field}});
    }

    public orIsNull(field: Field): ConditionGroup {
        return this.addCondition({type: ConditionType.NULL, parameters: {field}}, ConditionConnector.OR);
    }

    public notNull(field: Field): ConditionGroup {
        return this.addCondition({type: ConditionType.NOT_NULL, parameters: {field}});
    }

    public orNotNull(field: Field): ConditionGroup {
        return this.addCondition({type: ConditionType.NOT_NULL, parameters: {field}}, ConditionConnector.OR);
    }

    public in(field: Field, values: Array<any>): ConditionGroup {
        return this.addCondition({type: ConditionType.IN, parameters: {field, values}});
    }

    public orIn(field: Field, values: Array<any>): ConditionGroup {
        return this.addCondition({type: ConditionType.IN, parameters: {field, values}}, ConditionConnector.OR);
    }

    public notIn(field: Field, values: Array<any>): ConditionGroup {
        return this.addCondition({type: ConditionType.NOT_IN, parameters: {field, values}});
    }

    public orNotIn(field: Field, values: Array<any>): ConditionGroup {
        return this.addCondition({type: ConditionType.NOT_IN, parameters: {field, values}}, ConditionConnector.OR);
    }

    public like(field: Field, value: any, caseInsensitive: boolean = false): ConditionGroup {
        return this.addCondition({type: ConditionType.LIKE, parameters: {field, value, caseInsensitive}});
    }

    public orLike(field: Field, value: any, caseInsensitive: boolean = false): ConditionGroup {
        return this.addCondition({type: ConditionType.LIKE, parameters: {field, value, caseInsensitive}}, ConditionConnector.OR);
    }

    public notLike(field: Field, value: any, caseInsensitive: boolean = false): ConditionGroup {
        return this.addCondition({type: ConditionType.NOT_LIKE, parameters: {field, value, caseInsensitive}});
    }

    public orNotLike(field: Field, value: any, caseInsensitive: boolean = false): ConditionGroup {
        return this.addCondition({type: ConditionType.NOT_LIKE, parameters: {field, value, caseInsensitive}}, ConditionConnector.OR);
    }
}
