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

    public addCondition(condition: Condition, connector: ConditionConnector = ConditionConnector.AND) {
        this.conditions.push({condition, connector});
    }

    public clearConditions() {
        this.conditions = [];
    }
}
