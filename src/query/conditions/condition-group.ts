import { Field, FunctionField } from '../fields';
import { BasicCondition } from './basic-condition';
import { Condition } from './condition';
import { ConditionConnector } from './condition-connector';
import { RawCondition } from './raw-condition';

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

  public getConditionsCount(): number {
    return this.conditions.length;
  }

  public with(sql: string): ConditionGroup;
  public with(condition: Condition): ConditionGroup;
  public with(sql: string, bindings: Array<any>): ConditionGroup;
  public with(field: Field, value: any): ConditionGroup;
  public with(field: string, value: any): ConditionGroup;
  public with(field: {name: string, table?: string, functionName?: string}, value: any): ConditionGroup;
  public with(field: Field, operator: string, value: any): ConditionGroup;
  public with(field: string, operator: string, value: any): ConditionGroup;
  public with(field: {name: string, table?: string, functionName?: string}, operator: string, value: any): ConditionGroup;
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
          let field: Field;
          if (arguments[0] instanceof Field) {
            field = arguments[0];
          } else if (typeof arguments[0] === 'string') {
            field = new FunctionField(arguments[0]);
          } else {
            field = new FunctionField(arguments[0].name, arguments[0].table, arguments[0].functionName);
          }
          condition = new BasicCondition(field, '=', arguments[1]);
        }
        break;
      case 3:
        let field: Field;
        if (arguments[0] instanceof Field) {
          field = arguments[0];
        } else if (typeof arguments[0] === 'string') {
          field = new FunctionField(arguments[0]);
        } else {
          field = new FunctionField(arguments[0].name, arguments[0].table, arguments[0].functionName);
        }
        condition = new BasicCondition(field, arguments[1], arguments[2]);
        break;
    }
    this.addCondition(condition);
    return this;
  }

  public orWith(sql: string): ConditionGroup;
  public orWith(condition: Condition): ConditionGroup;
  public orWith(sql: string, bindings: Array<any>): ConditionGroup;
  public orWith(field: Field, value: any): ConditionGroup;
  public orWith(field: string, value: any): ConditionGroup;
  public orWith(field: {name: string, table?: string, functionName?: string}, value: any): ConditionGroup;
  public orWith(field: Field, operator: string, value: any): ConditionGroup;
  public orWith(field: string, operator: string, value: any): ConditionGroup;
  public orWith(field: {name: string, table?: string, functionName?: string}, operator: string, value: any): ConditionGroup;
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
          let field: Field;
          if (arguments[0] instanceof Field) {
            field = arguments[0];
          } else if (typeof arguments[0] === 'string') {
            field = new FunctionField(arguments[0]);
          } else {
            field = new FunctionField(arguments[0].name, arguments[0].table, arguments[0].functionName);
          }
          condition = new BasicCondition(field, '=', arguments[1]);
        }
        break;
      case 3:
        let field: Field;
        if (arguments[0] instanceof Field) {
          field = arguments[0];
        } else if (typeof arguments[0] === 'string') {
          field = new FunctionField(arguments[0]);
        } else {
          field = new FunctionField(arguments[0].name, arguments[0].table, arguments[0].functionName);
        }
        condition = new BasicCondition(field, arguments[1], arguments[2]);
        break;
    }
    this.addCondition(condition, ConditionConnector.OR);
    return this;
  }
}
