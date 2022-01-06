import {ConditionGroup} from '../conditions';
import {Field} from '../fields';

export abstract class HasWhereConditions<R> {

    protected conditions: ConditionGroup;

    public setWhereConditions(conditions: ConditionGroup): R {
        this.conditions = conditions;
        return this as unknown as R;
    }

    public getWhereConditions(): ConditionGroup {
        if (!this.conditions) {
            this.conditions = new ConditionGroup();
        }
        return this.conditions;
    }

    public clearWhereConditions(): R {
        this.getWhereConditions().clearConditions();
        return this as unknown as R;
    }
}