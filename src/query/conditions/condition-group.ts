import {Field} from '../fields';
import {Condition} from './condition';
import {RawCondition} from './raw-condition';
import {BasicCondition} from './basic-condition';
import {ConditionConnector} from './condition-connector';

export class ConditionGroup extends Condition {

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

    public with(sql: string);
    public with(condition: Condition);
    public with(sql: string, bindings: Array<any>);
    public with(field: Field, value: any);
    public with(field: Field, operator: string, value: any);
    public with(): ConditionGroup {
        let condition: Condition;
        switch (arguments.length) {
            case 1:
                if (typeof arguments[0] === 'string') {
                    condition = new RawCondition(arguments[0]);
                } else {
                    condition = arguments[0];
                }
                break;
            case 2:
                if (Array.isArray(arguments[1])) {
                    condition = new RawCondition(arguments[0], arguments[1]);
                } else {
                    condition = new BasicCondition(arguments[0], '=', arguments[1]);
                }
                break;
            case 3:
                condition = new BasicCondition(arguments[0], arguments[1], arguments[2]);
                break;
        }
        this.addCondition(condition);
        return this;
    }

    public orWith(sql: string);
    public orWith(condition: Condition);
    public orWith(sql: string, bindings: Array<any>);
    public orWith(field: Field, value: any);
    public orWith(field: Field, operator: string, value: any);
    public orWith(): ConditionGroup {
        let condition: Condition;
        switch (arguments.length) {
            case 1:
                if (typeof arguments[0] === 'string') {
                    condition = new RawCondition(arguments[0]);
                } else {
                    condition = arguments[0];
                }
                break;
            case 2:
                if (Array.isArray(arguments[1])) {
                    condition = new RawCondition(arguments[0], arguments[1]);
                } else {
                    condition = new BasicCondition(arguments[0], '=', arguments[1]);
                }
                break;
            case 3:
                condition = new BasicCondition(arguments[0], arguments[1], arguments[2]);
                break;
        }
        this.addCondition(condition);
        return this;
    }
}
