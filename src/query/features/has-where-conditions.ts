import {Condition, ConditionGroup} from '../conditions';
import {Field} from '../fields';

export abstract class HasWhereConditions<R> {

    protected whereConditions: ConditionGroup;

    public setWhereConditions(conditions: ConditionGroup): R {
        this.whereConditions = conditions;
        return this as unknown as R;
    }

    public getWhereConditions(): ConditionGroup {
        if (!this.whereConditions) {
            this.whereConditions = new ConditionGroup();
        }
        return this.whereConditions;
    }

    public clearWhereConditions(): R {
        this.getWhereConditions().clearConditions();
        return this as unknown as R;
    }

    public where (condition: Condition): R;
    public where (field: Field, value: any): R;
    public where (field: Field, operator: string, value: any): R;
    public where (conditionOrfield: Field | Condition, operatorOrValue?: any, value?: any): R {
        switch (arguments.length) {
            case 1:
                this.getWhereConditions().with(conditionOrfield as Condition);
                break;
            case 2:
                this.getWhereConditions().with(conditionOrfield as Field, operatorOrValue);
                break;
            case 3:
                this.getWhereConditions().with(conditionOrfield as Field, operatorOrValue, value);
                break;
        }
        return this as unknown as R;
    }

    public orWhere (condition: Condition): R;
    public orWhere (field: Field, value: any): R;
    public orWhere (field: Field, operator: string, value: any): R;
    public orWhere (conditionOrfield: Field | Condition, operatorOrValue?: any, value?: any): R {
        switch (arguments.length) {
            case 1:
                this.getWhereConditions().orWith(conditionOrfield as Condition);
                break;
            case 2:
                this.getWhereConditions().orWith(conditionOrfield as Field, operatorOrValue);
                break;
            case 3:
                this.getWhereConditions().orWith(conditionOrfield as Field, operatorOrValue, value);
                break;
        }
        return this as unknown as R;
    }
}
