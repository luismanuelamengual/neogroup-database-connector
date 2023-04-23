import { Condition, ConditionField, ConditionGroup, ConditionValue } from '../condition-group';

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
  public having(field: ConditionField, value: ConditionValue): R;
  public having(field: ConditionField, operator: string, value: ConditionValue): R;
  public having(): R {
    // @ts-ignore
    this.getHavingConditions().with(...arguments);
    return this as unknown as R;
  }

  public orHaving(condition: Condition): R;
  public orHaving(field: ConditionField, value: ConditionValue): R;
  public orHaving(field: ConditionField, operator: string, value: ConditionValue): R;
  public orHaving(): R {
    // @ts-ignore
    this.getHavingConditions().orWith(...arguments);
    return this as unknown as R;
  }
}
