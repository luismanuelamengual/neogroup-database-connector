import { Condition, ConditionGroup } from '../conditions';
import { Field } from '../fields';

export abstract class HasWhereConditions<R> {

  protected _whereConditions: ConditionGroup;

  public setWhereConditions(conditions: ConditionGroup): R {
    this._whereConditions = conditions;
    return this as unknown as R;
  }

  public getWhereConditions(): ConditionGroup {
    if (!this._whereConditions) {
      this._whereConditions = new ConditionGroup();
    }
    return this._whereConditions;
  }

  public where(condition: Condition): R;
  public where(field: Field, value: any): R;
  public where(field: Field, operator: string, value: any): R;
  public where(): R {
    // @ts-ignore
    this.getWhereConditions().with(...arguments);
    return this as unknown as R;
  }

  public orWhere(condition: Condition): R;
  public orWhere(field: Field, value: any): R;
  public orWhere(field: Field, operator: string, value: any): R;
  public orWhere(): R {
    // @ts-ignore
    this.getWhereConditions().orWith(...arguments);
    return this as unknown as R;
  }
}
