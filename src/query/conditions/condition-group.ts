import {Field} from '../fields';
import {Condition} from './condition';
import {ConditionConnector} from './condition-connector';

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

    public with (condition: Condition);
    public with (field: Field, value: any);
    public with (field: Field, operator: string, value: any);
    public with(conditionOrfield: Field | Condition, operatorOrValue?: any, value?: any): ConditionGroup {
        let condition: Condition;
        switch (arguments.length) {
            case 1:
                condition = conditionOrfield as Condition;
                break;
            case 2:
                condition = {field: conditionOrfield as Field, operator: '=', value: operatorOrValue};
                break;
            case 3:
                condition = {field: conditionOrfield as Field, operator: operatorOrValue, value};
                break;
        }
        this.addCondition(condition);
        return this;
    }

    public orWith (condition: Condition);
    public orWith (field: Field, value: any);
    public orWith (field: Field, operator: string, value: any);
    public orWith(conditionOrfield: Field | Condition, operatorOrValue?: any, value?: any): ConditionGroup {
        let condition: Condition;
        switch (arguments.length) {
            case 1:
                condition = conditionOrfield as Condition;
                break;
            case 2:
                condition = {field: conditionOrfield as Field, operator: '=', value: operatorOrValue};
                break;
            case 3:
                condition = {field: conditionOrfield as Field, operator: operatorOrValue, value};
                break;
        }
        this.addCondition(condition, ConditionConnector.OR);
        return this;
    }
}
