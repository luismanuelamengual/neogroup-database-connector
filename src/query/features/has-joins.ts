import { ConditionField, ConditionGroup } from '../condition-group';

export enum JoinType {
  JOIN,
  INNER_JOIN,
  OUTER_JOIN,
  LEFT_JOIN,
  RIGHT_JOIN,
  CROSS_JOIN
}

export type JoinTable = string | { schema?: string, name?: string };

export type Join = { table: JoinTable, type: JoinType, condition: ConditionGroup, alias?: string };

export abstract class HasJoins<R> {

  protected _joins: Array<Join>;

  public getJoins(): Array<Join> {
    if (!this._joins) {
      this._joins = [];
    }
    return this._joins;
  }

  public setJoins(joins: Array<Join>): R {
    this._joins = joins;
    return this as unknown as R;
  }

  public join(join: Join): R;
  public join(type: JoinType, table: JoinTable, sourceField: ConditionField, remoteField: ConditionField): R;
  public join(type: JoinType, table: JoinTable, sourceField: ConditionField, remoteField: ConditionField, alias: string): R;
  public join(type: JoinType, table: JoinTable, sourceField?: ConditionField, remoteField?: ConditionField, alias?: string): R
  public join(): R {
    let join: Join;
    if (arguments.length === 1) {
      join = arguments[0];
    } else {
      const [type, table, sourceField, remoteField, alias] = arguments;
      const condition = new ConditionGroup();
      condition.with(sourceField, typeof remoteField === 'object' ? remoteField : { name: remoteField });
      join = { type, table, condition, alias };
    }
    this.getJoins().push(join);
    return this as unknown as R;
  }

  public innerJoin(table: string, sourceField: ConditionField, remoteField: ConditionField): R;
  public innerJoin(table: string, sourceField: ConditionField, remoteField: ConditionField, alias: string): R;
  public innerJoin(table: string, sourceField?: ConditionField, remoteField?: ConditionField, alias?: string): R
  public innerJoin(): R {
    // @ts-ignore
    this.join(JoinType.INNER_JOIN, ...arguments);
    return this as unknown as R;
  }

  public leftJoin(table: string, sourceField: ConditionField, remoteField: ConditionField): R;
  public leftJoin(table: string, sourceField: ConditionField, remoteField: ConditionField, alias: string): R;
  public leftJoin(table: string, sourceField?: ConditionField, remoteField?: ConditionField, alias?: string): R
  public leftJoin(): R {
    // @ts-ignore
    this.join(JoinType.LEFT_JOIN, ...arguments);
    return this as unknown as R;
  }

  public rightJoin(table: string, sourceField: ConditionField, remoteField: ConditionField): R;
  public rightJoin(table: string, sourceField: ConditionField, remoteField: ConditionField, alias: string): R;
  public rightJoin(table: string, sourceField?: ConditionField, remoteField?: ConditionField, alias?: string): R
  public rightJoin(): R {
    // @ts-ignore
    this.join(JoinType.RIGHT_JOIN, ...arguments);
    return this as unknown as R;
  }

  public outerJoin(table: string, sourceField: ConditionField, remoteField: ConditionField): R;
  public outerJoin(table: string, sourceField: ConditionField, remoteField: ConditionField, alias: string): R;
  public outerJoin(table: string, sourceField?: ConditionField, remoteField?: ConditionField, alias?: string): R
  public outerJoin(): R {
    // @ts-ignore
    this.join(JoinType.OUTER_JOIN, ...arguments);
    return this as unknown as R;
  }

  public crossJoin(table: string, sourceField: ConditionField, remoteField: ConditionField): R;
  public crossJoin(table: string, sourceField: ConditionField, remoteField: ConditionField, alias: string): R;
  public crossJoin(table: string, sourceField?: ConditionField, remoteField?: ConditionField, alias?: string): R
  public crossJoin(): R {
    // @ts-ignore
    this.join(JoinType.CROSS_JOIN, ...arguments);
    return this as unknown as R;
  }
}
