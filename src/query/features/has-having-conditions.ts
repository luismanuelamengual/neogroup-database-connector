import { Condition, ConditionGroup } from '../conditions';
import { Field } from '../fields';

export abstract class HasHavingConditions<R> {

  protected _havingConditions: ConditionGroup;

  public setHavingConditions(conditions: ConditionGroup): R {
    this._havingConditions = conditions;
    return this as unknown as R;
  }

  public getHavingConditions(): ConditionGroup {
    if (!this._havingConditions) {
      this._havingConditions = new ConditionGroup();
    }
    return this._havingConditions;
  }

  public having(condition: Condition): R;
  public having(field: Field, value: any): R;
  public having(field: Field, operator: string, value: any): R;
  public having(): R {
    // @ts-ignore
    this.getHavingConditions().with(...arguments);
    return this as unknown as R;
  }

  public orHaving(condition: Condition): R;
  public orHaving(field: Field, value: any): R;
  public orHaving(field: Field, operator: string, value: any): R;
  public orHaving(): R {
    // @ts-ignore
    this.getHavingConditions().orWith(...arguments);
    return this as unknown as R;
  }
}
