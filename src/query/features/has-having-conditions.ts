import { Condition, ConditionGroup } from '../conditions';
import { Field } from '../fields';

export abstract class HasHavingConditions<R> {

  protected _havingConditions: ConditionGroup;

  public setHavingConditions(conditions: ConditionGroup): R {
    this._havingConditions = conditions;
    return this as unknown as R;
  }

  public getHavingConditions(): ConditionGroup {
    return this._havingConditions;
  }

  public having(sql: string): R;
  public having(condition: Condition): R;
  public having(sql: string, bindings: Array<any>): R;
  public having(field: Field, value: any): R;
  public having(field: string, value: any): R;
  public having(field: {name: string, table?: string, functionName?: string}, value: any): R;
  public having(field: Field, operator: string, value: any): R;
  public having(field: string, operator: string, value: any): R;
  public having(field: {name: string, table?: string, functionName?: string}, operator: string, value: any): R;
  public having(): R {
    // @ts-ignore
    this.getHavingConditions().with(...arguments);
    return this as unknown as R;
  }

  public orHaving(sql: string): R;
  public orHaving(condition: Condition): R;
  public orHaving(sql: string, bindings: Array<any>): R;
  public orHaving(field: Field, value: any): R;
  public orHaving(field: string, value: any): R;
  public orHaving(field: {name: string, table?: string, functionName?: string}, value: any): R;
  public orHaving(field: Field, operator: string, value: any): R;
  public orHaving(field: string, operator: string, value: any): R;
  public orHaving(field: {name: string, table?: string, functionName?: string}, operator: string, value: any): R;
  public orHaving(): R {
    // @ts-ignore
    this.getHavingConditions().orWith(...arguments);
    return this as unknown as R;
  }
}
