import { SelectQuery } from './select-query';

export type ConditionField = string | {name: string, table?: string, schema?: string};

export type ConditionValue = string | number | boolean | ConditionField | SelectQuery | Array<string | number | boolean> | null;

export type BasicCondition = { field: ConditionField, operator?: string, value: ConditionValue };

export type RawCondition = string | { sql: string, bindings: Array<any> };

export enum ConditionConnector { AND, OR };

export type Condition = RawCondition | BasicCondition | ConditionGroup;

export type ConnectedCondition = {condition: Condition, connector: ConditionConnector};

export class ConditionGroup {

  private conditions: Array<ConnectedCondition> = [];

  public setConditions(conditions: Array<ConnectedCondition>): ConditionGroup {
    this.conditions = conditions;
    return this;
  }

  public getConditions(): Array<{condition: Condition, connector: ConditionConnector}> {
    return this.conditions;
  }

  public with(condition: Condition): ConditionGroup;
  public with(field: ConditionField, value: ConditionValue): ConditionGroup;
  public with(field: ConditionField, operator: string, value: ConditionValue): ConditionGroup;
  public with(): ConditionGroup {
    let condition: Condition;
    switch (arguments.length) {
      case 1:
        condition = arguments[0];
        break;
      case 2: {
        const [ field, value ] = arguments;
        condition = { field, operator:'=', value };
        break;
      }
      case 3: {
        const [ field, operator, value ] = arguments;
        condition = { field, operator, value };
        break;
      }
    }
    this.conditions.push({ condition, connector: ConditionConnector.AND });
    return this;
  }

  public orWith(condition: Condition): ConditionGroup;
  public orWith(field: ConditionField, value: ConditionValue): ConditionGroup;
  public orWith(field: ConditionField, operator: string, value: ConditionValue): ConditionGroup;
  public orWith(): ConditionGroup {
    let condition: Condition;
    switch (arguments.length) {
      case 1:
        condition = arguments[0];
        break;
      case 2: {
        const [ field, value ] = arguments;
        condition = { field, operator:'=', value };
        break;
      }
      case 3: {
        const [ field, operator, value ] = arguments;
        condition = { field, operator, value };
        break;
      }
    }
    this.conditions.push({ condition, connector: ConditionConnector.OR });
    return this;
  }
}
